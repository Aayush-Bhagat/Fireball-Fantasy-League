import { db } from "@/db";
import { eq, sql, sum } from "drizzle-orm";
import { players, playerHistory, playerGamesStats } from "@/models/players";
import { games } from "@/models/games";
import { seasons } from "@/models/seasons";

export async function findPlayersByTeam(teamId: string) {
	const teamPlayers = await db.query.players.findMany({
		with: {
			team: { with: { conference: { columns: { name: true } } } },
		},
		where: eq(players.teamId, teamId),
	});

	return teamPlayers;
}

export async function findPlayerHistoryByPlayer(playerId: string) {
	const history = await db.query.playerHistory.findMany({
		where: eq(playerHistory.playerId, playerId),
		with: {
			team: { with: { conference: { columns: { name: true } } } },
		},
	});

	return history;
}

export async function findAllPlayers() {
	const allPlayers = await db.query.players.findMany({
		with: {
			team: { with: { conference: { columns: { name: true } } } },
		},
	});

	return allPlayers;
}

export async function findAllPlayerStats() {
	const seasonQuery = db
		.select({
			id: sql<number>`max(${seasons.id})`.as("id"),
		})
		.from(seasons);

	const stats = await db
		.select({
			playerId: players.id,
			name: players.name,
			atBats: sum(playerGamesStats.atBats).as("atBats"),
			hits: sum(playerGamesStats.hits).as("hits"),
			runs: sum(playerGamesStats.runs).as("runs"),
			rbis: sum(playerGamesStats.rbis).as("rbis"),
			walks: sum(playerGamesStats.walks).as("walks"),
			strikeouts: sum(playerGamesStats.strikeouts).as("strikeouts"),
			homeRuns: sum(playerGamesStats.homeRuns).as("homeRuns"),
			outsPitched: sum(playerGamesStats.outsPitched).as("outsPitched"),
			runsAllowed: sum(playerGamesStats.runsAllowed).as("runsAllowed"),
			outs: sum(playerGamesStats.outs).as("outs"),
		})
		.from(players)
		.leftJoin(playerGamesStats, eq(players.id, playerGamesStats.playerId))
		.leftJoin(games, eq(playerGamesStats.gameId, games.id))
		.where(eq(games.seasonId, seasonQuery))
		.groupBy(players.id);

	return stats;
}
