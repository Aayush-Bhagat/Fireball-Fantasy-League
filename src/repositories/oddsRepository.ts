import { sql, eq, and, ne, isNotNull, avg, count, countDistinct } from "drizzle-orm";
import { db } from "@/db";
import { games, teamGames } from "@/models/games";
import { alias } from "drizzle-orm/pg-core";

/**
 * Aggregated run environment + head-to-head data needed by the odds engine.
 * All queries are bulk (one per season) so odds for an entire schedule can be
 * computed without per-match round-trips.
 *
 * "Completed" is defined as a {@link teamGames} row whose `outcome` is set
 * (scores/outcomes are written together by the game-update flow).
 */

export interface LeagueRunEnvironment {
	/** League-wide average runs per game, per side (L_R). 0 if no games. */
	leagueRpg: number;
	/** Total completed games in the season. */
	completedGames: number;
}

/**
 * Per-team season run averages for completed games only.
 * `runsScored` = AVG(score) for the team; `runsAllowed` = AVG(opponent score).
 */
export interface TeamRunAverages {
	teamId: string;
	runsScored: number;
	runsAllowed: number;
	gamesPlayed: number;
}

/**
 * Head-to-head record, directed (teamA's perspective).
 * One row per ordered (teamA, teamB) pair that has played at least once.
 */
export interface HeadToHeadRecord {
	teamAId: string;
	teamBId: string;
	gamesPlayed: number;
	teamAWins: number;
}

/** Resolve a numeric season id, or null to mean "the in-progress season". */
function resolveSeasonId(seasonId: number | null) {
	return seasonId;
}

/** League-wide total runs & completed-game count for the dynamic exponent. */
export async function findLeagueRunEnvironment(
	seasonId: number | null,
): Promise<LeagueRunEnvironment> {
	const rows = await db
		.select({
			totalRuns: sql<number>`COALESCE(SUM(${teamGames.score}), 0)`,
			completedGames: countDistinct(games.id),
		})
		.from(teamGames)
		.innerJoin(games, eq(teamGames.gameId, games.id))
		.where(
			and(
				eq(games.seasonId, sql<number>`${resolveSeasonId(seasonId)}`),
				isNotNull(teamGames.outcome),
			),
		);

	const totalRuns = Number(rows[0]?.totalRuns ?? 0);
	const completedGames = Number(rows[0]?.completedGames ?? 0);

	const leagueRpg =
		completedGames > 0 ? totalRuns / (2 * completedGames) : 0;

	return { leagueRpg, completedGames };
}

/** Season run averages (RS / RA) per team across completed games. */
export async function findTeamRunAverages(
	seasonId: number | null,
): Promise<TeamRunAverages[]> {
	const opponent = alias(teamGames, "opponent");

	const rows = await db
		.select({
			teamId: teamGames.teamId,
			runsScored: avg(teamGames.score),
			runsAllowed: avg(opponent.score),
			gamesPlayed: count(teamGames.gameId),
		})
		.from(teamGames)
		.innerJoin(games, eq(teamGames.gameId, games.id))
		.innerJoin(
			opponent,
			and(
				eq(opponent.gameId, teamGames.gameId),
				ne(opponent.teamId, teamGames.teamId),
			),
		)
		.where(
			and(
				eq(games.seasonId, sql<number>`${resolveSeasonId(seasonId)}`),
				isNotNull(teamGames.outcome),
			),
		)
		.groupBy(teamGames.teamId);

	return rows.map((row) => ({
		teamId: row.teamId,
		runsScored: Number(row.runsScored ?? 0),
		runsAllowed: Number(row.runsAllowed ?? 0),
		gamesPlayed: Number(row.gamesPlayed ?? 0),
	}));
}

/**
 * All head-to-head records for the season (completed games only), directed.
 * The caller builds an unordered lookup keyed by the sorted team-id pair.
 */
export async function findHeadToHeadRecords(
	seasonId: number | null,
): Promise<HeadToHeadRecord[]> {
	const opponent = alias(teamGames, "opponent");

	const rows = await db
		.select({
			teamAId: teamGames.teamId,
			teamBId: opponent.teamId,
			gamesPlayed: count(teamGames.gameId),
			teamAWins: sql<number>`SUM(CASE WHEN ${teamGames.outcome} = 'Win' THEN 1 ELSE 0 END)`,
		})
		.from(teamGames)
		.innerJoin(games, eq(teamGames.gameId, games.id))
		.innerJoin(
			opponent,
			and(
				eq(opponent.gameId, teamGames.gameId),
				ne(opponent.teamId, teamGames.teamId),
			),
		)
		.where(
			and(
				eq(games.seasonId, sql<number>`${resolveSeasonId(seasonId)}`),
				isNotNull(teamGames.outcome),
			),
		)
		.groupBy(teamGames.teamId, opponent.teamId);

	return rows.map((row) => ({
		teamAId: row.teamAId,
		teamBId: row.teamBId,
		gamesPlayed: Number(row.gamesPlayed ?? 0),
		teamAWins: Number(row.teamAWins ?? 0),
	}));
}
