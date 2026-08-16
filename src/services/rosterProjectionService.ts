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

		const [players, leagueAverages] = await Promise.all([
			findRosterStats(teamId, seasonIds),
			findLeagueAverages(seasonIds),
		]);
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
 * Project multiple team rosters in parallel. Returns a Map keyed by
 * teamId; teams that fail to project are omitted from the map (rather
 * than mapped to `null`) so callers can use a simple `has` check.
 */
export async function projectMultipleTeamRosters(
	teamIds: string[],
	configOverride?: Partial<ProjectionConfig>,
): Promise<Map<string, TeamProjection>> {
	const unique = [...new Set(teamIds)];
	const results = await Promise.all(
		unique.map(async (id) => {
			const projection = await projectTeamRoster(id, configOverride);
			return { id, projection };
		}),
	);
	const out = new Map<string, TeamProjection>();
	for (const { id, projection } of results) {
		if (projection) out.set(id, projection);
	}
	return out;
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