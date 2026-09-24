/**
 * Roster projection repository.
 *
 * Drizzle queries that assemble the inputs the projector needs:
 * - Per-team per-season player aggregates from `playerGamesStats`,
 *   with the `dataVersion` flag derived from `seasonId`.
 * - League-wide per-season averages from `playerGamesStats` and
 *   `teamGames` (for `leagueAbPerGame`).
 *
 * No schema changes — the `dataVersion` column is computed in SQL via
 * a `CASE` on `seasonId`. Matches the convention in
 * `oddsRepository.findTeamRunAverages`.
 */

import { sql, eq, and, inArray, isNotNull } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { db } from "@/db";
import { players, playerGamesStats } from "@/models/players";
import { games, teamGames } from "@/models/games";
import {
	DataVersion,
	LeagueAverages,
	PlayerSeasonStats,
} from "@/dtos/projectionDtos";

/* -------------------------------------------------------------------------- */
/* Roster aggregates                                                            */
/* -------------------------------------------------------------------------- */

/**
 * A per-(team, player, season) aggregate row. Same shape the projector
 * consumes, plus the owning `teamId` so a batched result can be grouped
 * by team in the service.
 */
export type RosterStatsRow = PlayerSeasonStats & { teamId: string };

/**
 * One row per (team, player, season) with summed stats, for every team
 * in `teamIds` at once. `dataVersion` is derived from `seasonId`
 * (`<= 4` → `"legacy"`, otherwise `"new"`).
 *
 * Batched deliberately: a single query replaces N per-team round trips,
 * and filtering `teamId` in SQL means a 2-team odds request doesn't pull
 * the whole league's rows. Callers group the result by `teamId`.
 */
export async function findRostersStats(
	teamIds: string[],
	seasonIds: number[],
): Promise<RosterStatsRow[]> {
	if (teamIds.length === 0 || seasonIds.length === 0) return [];

	const rows = await db
		.select({
			teamId: players.teamId,
			playerId: players.id,
			seasonId: games.seasonId,
			atBats: sql<number>`COALESCE(SUM(${playerGamesStats.atBats}), 0)`,
			hits: sql<number>`COALESCE(SUM(${playerGamesStats.hits}), 0)`,
			runs: sql<number>`COALESCE(SUM(${playerGamesStats.runs}), 0)`,
			rbis: sql<number>`COALESCE(SUM(${playerGamesStats.rbis}), 0)`,
			walks: sql<number>`COALESCE(SUM(${playerGamesStats.walks}), 0)`,
			strikeouts: sql<number>`COALESCE(SUM(${playerGamesStats.strikeouts}), 0)`,
			homeRuns: sql<number>`COALESCE(SUM(${playerGamesStats.homeRuns}), 0)`,
			outsPitched: sql<number>`COALESCE(SUM(${playerGamesStats.outsPitched}), 0)`,
			runsAllowed: sql<number>`COALESCE(SUM(${playerGamesStats.runsAllowed}), 0)`,
			outs: sql<number>`COALESCE(SUM(${playerGamesStats.outs}), 0)`,
		})
		.from(players)
		.leftJoin(playerGamesStats, eq(playerGamesStats.playerId, players.id))
		.leftJoin(games, eq(games.id, playerGamesStats.gameId))
		.where(
			and(
				inArray(players.teamId, teamIds),
				inArray(games.seasonId, seasonIds),
			),
		)
		.groupBy(players.teamId, players.id, games.seasonId)
		.orderBy(players.teamId, players.id, games.seasonId);

	return rows.map((row) => {
		const seasonId = Number(row.seasonId);
		const dataVersion: DataVersion = seasonId <= 4 ? "legacy" : "new";
		return {
			teamId: row.teamId ?? "",
			playerId: row.playerId,
			seasonId,
			dataVersion,
			atBats: Number(row.atBats ?? 0),
			hits: Number(row.hits ?? 0),
			runs: Number(row.runs ?? 0),
			rbis: Number(row.rbis ?? 0),
			walks: Number(row.walks ?? 0),
			strikeouts: Number(row.strikeouts ?? 0),
			homeRuns: Number(row.homeRuns ?? 0),
			outsPitched: Number(row.outsPitched ?? 0),
			runsAllowed: Number(row.runsAllowed ?? 0),
			outs: Number(row.outs ?? 0),
		};
	});
}

/* -------------------------------------------------------------------------- */
/* League averages                                                              */
/* -------------------------------------------------------------------------- */

/**
 * League-wide per-season averages. One row per season.
 *
 * - `leagueAbPerGame` is per team per game (sum of ABs across all
 *   players / game count), so it slots directly into
 *   `projectedRS = teamRunRate × leagueAbPerGame`.
 */
export async function findLeagueAverages(
	seasonIds: number[],
): Promise<LeagueAverages[]> {
	if (seasonIds.length === 0) return [];

	const opponent = alias(teamGames, "opponent");

	// Pull total ABs and total games in one query so we can compute
	// `leagueAbPerGame` without a follow-up round trip.
	const rows = await db
		.select({
			seasonId: games.seasonId,
			totalAtBats: sql<number>`SUM(${playerGamesStats.atBats})`,
			totalHits: sql<number>`SUM(${playerGamesStats.hits})`,
			totalWalks: sql<number>`SUM(${playerGamesStats.walks})`,
			totalRbis: sql<number>`SUM(${playerGamesStats.rbis})`,
			totalStrikeouts: sql<number>`SUM(${playerGamesStats.strikeouts})`,
			totalHomeRuns: sql<number>`SUM(${playerGamesStats.homeRuns})`,
			totalRunsAllowed: sql<number>`SUM(${playerGamesStats.runsAllowed})`,
			totalOutsPitched: sql<number>`SUM(${playerGamesStats.outsPitched})`,
			gamesPlayed: sql<number>`COUNT(DISTINCT ${teamGames.gameId})`,
		})
		.from(playerGamesStats)
		.innerJoin(
			teamGames,
			and(
				eq(teamGames.gameId, playerGamesStats.gameId),
				eq(teamGames.teamId, playerGamesStats.teamId),
			),
		)
		.innerJoin(games, eq(games.id, playerGamesStats.gameId))
		.innerJoin(
			opponent,
			and(
				eq(opponent.gameId, teamGames.gameId),
				sql`${opponent.teamId} <> ${teamGames.teamId}`,
			),
		)
		.where(
			and(
				sql`${games.seasonId} = ANY(${sql.raw(`ARRAY[${seasonIds.join(",")}]::integer[]`)})`,
				isNotNull(teamGames.outcome),
			),
		)
		.groupBy(games.seasonId)
		.orderBy(games.seasonId);

	return rows.map((row) => {
		const seasonId = Number(row.seasonId);
		const dataVersion: DataVersion = seasonId <= 4 ? "legacy" : "new";

		const totalAb = Number(row.totalAtBats ?? 0);
		const totalHits = Number(row.totalHits ?? 0);
		const totalWalks = Number(row.totalWalks ?? 0);
		const totalRbis = Number(row.totalRbis ?? 0);
		const totalK = Number(row.totalStrikeouts ?? 0);
		const totalHr = Number(row.totalHomeRuns ?? 0);
		const totalRa = Number(row.totalRunsAllowed ?? 0);
		const totalOp = Number(row.totalOutsPitched ?? 0);
		const gamesPlayed = Number(row.gamesPlayed ?? 0);

		// `totalAb / gamesPlayed` is summed across both teams per game;
		// divide by 2 to get per-team per-game AB.
		const leagueAbPerGame = gamesPlayed > 0 ? totalAb / gamesPlayed / 2 : 0;
		const leagueAvg = totalAb > 0 ? totalHits / totalAb : 0;
		const denomObp = totalAb + totalWalks;
		const leagueObp = denomObp > 0 ? (totalHits + totalWalks) / denomObp : leagueAvg;
		const leagueRbiPerAb = totalAb > 0 ? totalRbis / totalAb : 0;
		const leagueKRate = totalAb > 0 ? totalK / totalAb : 0;
		const leagueHrPerAb = totalAb > 0 ? totalHr / totalAb : 0;
		const leagueRa9 = totalOp > 0 ? (totalRa / totalOp) * 27 : 0;
		const leagueKPer9 = totalOp > 0 ? (totalK / totalOp) * 27 : 0;

		return {
			seasonId,
			dataVersion,
			leagueAvg,
			leagueObp,
			leagueRbiPerAb,
			leagueKRate,
			leagueHrPerAb,
			leagueRa9,
			leagueKPer9,
			leagueAbPerGame,
		};
	});
}

/* -------------------------------------------------------------------------- */
/* Active season helper                                                         */
/* -------------------------------------------------------------------------- */

/**
 * Return the last N season ids (most-recent first) for "current"
 * projection runs. Mirrors the convention in `oddsRepository.seasonRef`
 * (the in-progress season is the canonical one for fresh lookups).
 */
export async function findActiveSeasonIds(
	count: number,
): Promise<number[]> {
	const rows = await db
		.select({ id: sql<number>`${games.seasonId}` })
		.from(games)
		.groupBy(games.seasonId)
		.orderBy(sql`${games.seasonId} DESC`)
		.limit(count);

	return rows.map((r) => Number(r.id));
}