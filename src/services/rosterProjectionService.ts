/**
 * Roster projection service.
 *
 * Glue between the projection repository (DB) and the projector (pure
 * math). Loads the roster aggregates and league averages, hands them
 * to `projectRoster`, and returns the {@link TeamProjection}.
 *
 * Designed for safe failure: if the cached computation throws (e.g. the
 * DB pool is exhausted), the public functions return `null` / an empty
 * map rather than letting the caller crash. Callers in the odds engine
 * use that to fall back to the pre-projection behavior.
 *
 * Caching: projections only change when stats are entered or a roster
 * moves, so the whole batch is cached in Next's data cache under
 * {@link ROSTER_PROJECTION_CACHE_TAG}. Route handlers invalidate the tag
 * on stat entry / roster changes; a TTL is kept as a safety net.
 *
 * Connection-pool awareness: the uncached computation needs only three
 * queries per batch (`findActiveSeasonIds`, `findLeagueAverages`, and one
 * batched roster query). The roster query runs alongside the league
 * averages, so a cache miss uses at most two pooled connections no
 * matter how many teams were requested.
 */

import { unstable_cache } from "next/cache";
import {
	findActiveSeasonIds,
	findLeagueAverages,
	findRostersStats,
} from "@/repositories/rosterProjectionRepository";
import {
	projectRoster,
} from "@/lib/rosterProjector";
import {
	DEFAULT_PROJECTION_CONFIG,
	PlayerSeasonStats,
	ProjectionConfig,
	RosterStats,
	TeamProjection,
} from "@/dtos/projectionDtos";
import { ROSTER_PROJECTION_CACHE_TAG } from "@/lib/cacheTags";

/**
 * Safety-net TTL for the projection cache. Normal freshness comes from
 * `revalidateTag(ROSTER_PROJECTION_CACHE_TAG)` on stat/roster changes;
 * this bounds staleness if a mutation path forgets to invalidate.
 */
const CACHE_REVALIDATE_SECONDS = 60 * 60;

/** Serializable cache value: a `Map` would not survive the data cache. */
type CachedProjectionEntry = {
	teamId: string;
	projection: TeamProjection;
};

/**
 * Uncached batch computation.
 *
 * Deliberately lets any DB error propagate: `unstable_cache` does not
 * cache rejections, so a transient pool failure is retried on the next
 * request instead of being frozen as "no projections" for the TTL.
 */
async function computeProjectionEntries(
	teamIds: string[],
	configOverride?: Partial<ProjectionConfig>,
): Promise<CachedProjectionEntry[]> {
	const seasonIds = await findActiveSeasonIds(4);
	if (seasonIds.length === 0) return [];

	// One batched roster query for every requested team, alongside the
	// league averages. Both hit the pool once, in parallel.
	const [leagueAverages, rosterRows] = await Promise.all([
		findLeagueAverages(seasonIds),
		findRostersStats(teamIds, seasonIds),
	]);

	// Group the rows by team, then project each requested team. A team
	// with no roster rows is omitted (same as the old per-team skip).
	const byTeam = new Map<string, PlayerSeasonStats[]>();
	for (const { teamId, ...stats } of rosterRows) {
		const list = byTeam.get(teamId);
		if (list) list.push(stats);
		else byTeam.set(teamId, [stats]);
	}

	const config = mergeConfig(configOverride);
	const out: CachedProjectionEntry[] = [];
	for (const teamId of teamIds) {
		const players = byTeam.get(teamId);
		if (!players || players.length === 0) continue;
		const roster: RosterStats = { teamId, players, leagueAverages };
		out.push({ teamId, projection: projectRoster(roster, config) });
	}

	return out;
}

/**
 * Cached batch computation. Keyed by the (order-independent) team-id
 * set, so the full-schedule batch (all teams) and the two-team odds
 * calculator each get their own entry, and repeated renders of the same
 * set are served without touching the DB. Bump the key part if
 * DEFAULT_PROJECTION_CONFIG changes so stale projections aren't served.
 *
 * Only the default config is cached. Callers passing a `configOverride`
 * (the calibration scripts) bypass the cache.
 */
const getCachedProjectionEntries = unstable_cache(
	(teamIds: string[]) => computeProjectionEntries(teamIds),
	["roster-projections-v1"],
	{
		revalidate: CACHE_REVALIDATE_SECONDS,
		tags: [ROSTER_PROJECTION_CACHE_TAG],
	},
);

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
	const projections = await projectMultipleTeamRosters(
		[teamId],
		configOverride,
	);
	return projections.get(teamId) ?? null;
}

/**
 * Project multiple team rosters. Returns a Map keyed by teamId; teams
 * that fail to project are omitted from the map (rather than mapped to
 * `null`) so callers can use a simple `has` check.
 *
 * On a cache hit this is zero DB round-trips; on a miss it computes the
 * batch once and stores it under {@link ROSTER_PROJECTION_CACHE_TAG}.
 */
export async function projectMultipleTeamRosters(
	teamIds: string[],
	configOverride?: Partial<ProjectionConfig>,
): Promise<Map<string, TeamProjection>> {
	const unique = [...new Set(teamIds.filter(Boolean))].sort();
	const out = new Map<string, TeamProjection>();
	if (unique.length === 0) return out;

	try {
		const entries = configOverride
			? await computeProjectionEntries(unique, configOverride)
			: await getCachedProjectionEntries(unique);

		for (const { teamId, projection } of entries) {
			out.set(teamId, projection);
		}
	} catch (error) {
		// Don't break the odds flow on a bad projection — and don't cache
		// the failure (see `computeProjectionEntries`). Callers fall back
		// to the non-projection odds.
		console.error(
			"[rosterProjectionService] Failed to compute projections:",
			error,
		);
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