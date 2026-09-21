/**
 * Roster projection service.
 *
 * Glue between the projection repository (DB) and the projector (pure
 * math). Loads the roster aggregates and league averages, hands them
 * to `projectRoster`, and returns the {@link TeamProjection}.
 *
 * Designed for safe failure: if any step throws (e.g. an empty team
 * roster), the service returns `null` rather than letting the caller
 * crash. Callers in the odds engine use `null` to fall back to the
 * pre-projection behavior.
 *
 * Connection-pool awareness: the multi-team entry point fetches the
 * shared inputs (`findActiveSeasonIds`, `findLeagueAverages`) ONCE
 * for the whole batch and processes per-team queries in bounded
 * chunks. This avoids blowing the Supabase pooler's 15-client limit
 * when called from `computeSeasonOdds` over a 10-team league
 * (~30 concurrent queries if fanned out naively).
 */

import {
	findActiveSeasonIds,
	findLeagueAverages,
	findRosterStats,
} from "@/repositories/rosterProjectionRepository";
import {
	projectRoster,
} from "@/lib/rosterProjector";
import {
	DEFAULT_PROJECTION_CONFIG,
	ProjectionConfig,
	RosterStats,
	TeamProjection,
} from "@/dtos/projectionDtos";

/**
 * How many per-team `findRosterStats` calls to issue at once. Each call
 * uses one pooled connection; with Supabase's pooler capped at 15
 * clients, 5 keeps us well under the limit even when the same request
 * is also running other queries (e.g. the schedule fetch).
 */
const PER_TEAM_CONCURRENCY = 5;

/**
 * Project a single team's roster.
 *
 * Returns `null` if the team has no roster data for the requested
 * seasons (caller should treat as "no projection available").
 */
export async function projectTeamRoster(
	teamId: string,
	configOverride?: Partial<ProjectionConfig>,
): Promise<TeamProjection | null> {
	try {
		const seasonIds = await findActiveSeasonIds(4);
		if (seasonIds.length === 0) return null;

		const leagueAverages = await findLeagueAverages(seasonIds);
		const players = await findRosterStats(teamId, seasonIds);
		if (players.length === 0) return null;

		const roster: RosterStats = {
			teamId,
			players,
			leagueAverages,
		};

		const config = mergeConfig(configOverride);
		return projectRoster(roster, config);
	} catch (error) {
		// Don't break the odds flow on a bad projection. Log and move on.
		console.error(
			`[rosterProjectionService] Failed to project team ${teamId}:`,
			error,
		);
		return null;
	}
}

/**
 * Project multiple team rosters. Returns a Map keyed by teamId; teams
 * that fail to project are omitted from the map (rather than mapped to
 * `null`) so callers can use a simple `has` check.
 *
 * Internally:
 *   1. `findActiveSeasonIds(4)` once.
 *   2. `findLeagueAverages(seasonIds)` once (shared across teams).
 *   3. `findRosterStats(teamId, seasonIds)` per team, processed in
 *      chunks of `PER_TEAM_CONCURRENCY` to stay under the pool limit.
 *
 * Net cost: 2 + ⌈N / concurrency⌉ pooled connections instead of 3N.
 */
export async function projectMultipleTeamRosters(
	teamIds: string[],
	configOverride?: Partial<ProjectionConfig>,
): Promise<Map<string, TeamProjection>> {
	const unique = [...new Set(teamIds)];
	const out = new Map<string, TeamProjection>();
	if (unique.length === 0) return out;

	try {
		const seasonIds = await findActiveSeasonIds(4);
		if (seasonIds.length === 0) return out;

		const leagueAverages = await findLeagueAverages(seasonIds);
		const config = mergeConfig(configOverride);

		// Process per-team queries in bounded chunks. Each chunk awaits
		// before the next one starts, so we never have more than
		// `PER_TEAM_CONCURRENCY` pooled connections in flight for the
		// per-team step.
		for (let i = 0; i < unique.length; i += PER_TEAM_CONCURRENCY) {
			const chunk = unique.slice(i, i + PER_TEAM_CONCURRENCY);
			const chunkResults = await Promise.all(
				chunk.map(async (teamId) => {
					try {
						const players = await findRosterStats(teamId, seasonIds);
						if (players.length === 0) return null;
						const roster: RosterStats = {
							teamId,
							players,
							leagueAverages,
						};
						const projection = projectRoster(roster, config);
						return { teamId, projection };
					} catch (error) {
						console.error(
							`[rosterProjectionService] Failed to project team ${teamId}:`,
							error,
						);
						return null;
					}
				}),
			);
			for (const r of chunkResults) {
				if (r) out.set(r.teamId, r.projection);
			}
		}

		return out;
	} catch (error) {
		// Shared-fetch failure (season ids / league averages). Bail out
		// for the whole batch — odds flow falls back to no projection.
		console.error(
			"[rosterProjectionService] Failed to fetch shared inputs:",
			error,
		);
		return out;
	}
}

/**
 * Merge a partial config override on top of the defaults. Supports
 * overriding either the entire hand-tuned block, the entire calibration
 * block, or one calibration set within the calibration block.
 */
function mergeConfig(
	override?: Partial<ProjectionConfig>,
): ProjectionConfig {
	if (!override) return DEFAULT_PROJECTION_CONFIG;
	return {
		handTuned: {
			...DEFAULT_PROJECTION_CONFIG.handTuned,
			...override.handTuned,
		},
		calibration: {
			...DEFAULT_PROJECTION_CONFIG.calibration,
			...override.calibration,
		},
	};
}