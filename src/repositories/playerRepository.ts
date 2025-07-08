import { db } from "@/db";
import { eq, sql, sum, and, countDistinct } from "drizzle-orm";
import { players, playerHistory, playerGamesStats } from "@/models/players";
import { games } from "@/models/games";
import { seasons } from "@/models/seasons";
import { teamLineups, teams } from "@/models/teams";
import { TeamLineupPosition } from "@/dtos/teamDtos";

export async function findPlayersByTeam(teamId: string) {
	const teamPlayers = await db.query.players.findMany({
		with: {
			team: { with: { conference: { columns: { name: true } } } },
			teamLineups: true,
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
			teamLineups: true,
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
			gamesPlayed: countDistinct(playerGamesStats.gameId).as(
				"gamesPlayed"
			),
		})
		.from(players)
		.leftJoin(playerGamesStats, eq(players.id, playerGamesStats.playerId))
		.leftJoin(games, eq(playerGamesStats.gameId, games.id))
		.where(eq(games.seasonId, seasonQuery))
		.groupBy(players.id);

	return stats;
}

export async function findPlayerInfo(playerId: string) {
	const player = await db.query.players.findFirst({
		where: eq(players.id, playerId),
		with: {
			team: { with: { conference: { columns: { name: true } } } },
		},
	});

	return player;
}

export async function findPlayerCareerStats(playerId: string) {
	const stats = await db
		.select({
			seasonId: seasons.id,
			playerId: players.id,
			playerName: players.name,
			homeRuns: sql<number>`coalesce(sum(${playerGamesStats.homeRuns}), 0) `,
			atBats: sql<number>`coalesce(sum(${playerGamesStats.atBats}), 0)`,
			hits: sql<number>`coalesce(sum(${playerGamesStats.hits}), 0)`,
			runs: sql<number>`coalesce(sum(${playerGamesStats.runs}), 0)`,
			RBIs: sql<number>`coalesce(sum(${playerGamesStats.rbis}), 0)`,
			walks: sql<number>`coalesce(sum(${playerGamesStats.walks}), 0)`,
			strikeouts: sql<number>`coalesce(sum(${playerGamesStats.strikeouts}), 0)`,
			outsPitched: sql<number>`coalesce(sum(${playerGamesStats.outsPitched}), 0)`,
			runsAllowed: sql<number>`coalesce(sum(${playerGamesStats.runsAllowed}), 0)`,
			outs: sql<number>`coalesce(sum(${playerGamesStats.outs}), 0)`,
			teamsPlayedFor: sql<
				string[]
			>`ARRAY_AGG(DISTINCT ${teams.abbreviation}) FILTER (WHERE ${teams.id} IS NOT NULL)`.as(
				"teams_played_for"
			),
		})
		.from(seasons)
		.crossJoin(players)
		.leftJoin(games, eq(games.seasonId, seasons.id))
		.leftJoin(
			playerGamesStats,
			and(
				eq(playerGamesStats.gameId, games.id),
				eq(playerGamesStats.playerId, players.id)
			)
		)
		.leftJoin(teams, eq(teams.id, playerGamesStats.teamId))
		.where(eq(players.id, playerId))
		.groupBy(seasons.id, players.id, players.name)
		.orderBy(seasons.id);

	return stats;
}

export async function findPlayersByTeamId(teamId: string) {
	const teamPlayers = await db.query.players.findMany({
		where: eq(players.teamId, teamId),
		with: {
			team: { with: { conference: { columns: { name: true } } } },
		},
	});

	return teamPlayers;
}

export async function findPlayerPosition(playerId: string) {
	const player = await db.query.players.findFirst({
		where: eq(players.id, playerId),
		with: {
			teamLineups: true,
		},
	});

	if (!player || !player.teamLineups) {
		return null;
	}

	return player.teamLineups;
}

export async function updatePlayerTeam(playerId: string, newTeamId: string) {
	const updatedPlayer = await db
		.update(players)
		.set({ teamId: newTeamId })
		.where(eq(players.id, playerId))
		.returning();

	if (updatedPlayer.length === 0) {
		throw new Error("Player not found or update failed");
	}

	return updatedPlayer[0];
}

export async function updatePlayerPosition(
	playerId: string,
	newPosition: TeamLineupPosition | null
) {
	const updatedPlayer = await db
		.update(teamLineups)
		.set({ fieldingPosition: newPosition })
		.where(eq(teamLineups.playerId, playerId))
		.returning();

	if (updatedPlayer.length === 0) {
		throw new Error("Player not found or update failed");
	}

	return updatedPlayer[0];
}

export async function savePlayerHistory(
	id: string,
	playerId: string,
	teamId: string,
	seasonId: number,
	type: "Trade" | "Draft",
	tradeId: string | null = null,
	draftRound: number | null = null,
	draftPick: number | null = null
) {
	const playerHistoryEntry = await db
		.insert(playerHistory)
		.values({
			id: id,
			playerId,
			teamId,
			seasonId,
			type,
			tradeId,
			draftRound,
			draftPick,
		})
		.returning();

	if (playerHistoryEntry.length === 0) {
		throw new Error("Failed to save player history");
	}

	return playerHistoryEntry[0];
}
