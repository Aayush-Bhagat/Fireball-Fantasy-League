import { sql, eq, and, ne, isNotNull, avg, count, countDistinct } from "drizzle-orm";
import { db } from "@/db";
import { games, teamGames } from "@/models/games";
import { seasons } from "@/models/seasons";
import { alias } from "drizzle-orm/pg-core";

/**
 * Season-to-date aggregate queries used to compute odds for an arbitrary
 * team pair (the schedule-page odds calculator).
 *
 * Unlike the going-in odds on schedule cards (which fold games week-by-week
 * in memory to exclude a game's own result), these are end-of-season-style
 * aggregates over ALL completed games — the right model for a hypothetical
 * "next matchup" between two teams based on the season so far.
 *
 * "Completed" = a {@link teamGames} row whose `outcome` is set (scores and
 * outcomes are written together by the game-update flow).
 */

export interface LeagueRunEnvironment {
	/** League-wide average runs per game, per side (L_R). 0 if no games. */
	leagueRpg: number;
	/** Total completed games in the season. */
	completedGames: number;
}

export interface TeamRunAverages {
	teamId: string;
	runsScored: number;
	runsAllowed: number;
	gamesPlayed: number;
}

export interface HeadToHeadRecord {
	teamAId: string;
	teamBId: string;
	gamesPlayed: number;
	teamAWins: number;
}

/** Resolve a season id for SQL embedding (null = in-progress season query). */
function seasonRef(seasonId: number | null) {
	if (seasonId !== null) return sql<number>`${seasonId}`;
	// Match the codebase convention: a subquery selecting the in-progress season.
	return db.select({ id: seasons.id }).from(seasons).where(eq(seasons.status, "in_progress"));
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
				eq(games.seasonId, seasonRef(seasonId)),
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
				eq(games.seasonId, seasonRef(seasonId)),
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

/** All head-to-head records for the season (completed games only), directed. */
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
				eq(games.seasonId, seasonRef(seasonId)),
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
