import { sql, eq, and, sum, countDistinct, inArray } from "drizzle-orm";
import { db } from "@/db";
import { games, teamGames } from "@/models/games";
import { conferences, keepSlots, teams } from "@/models/teams";
import { seasons } from "@/models/seasons";
import { playerGamesStats, players } from "@/models/players";
import { teamLineups } from "@/models/teams";
import { BattingOrderPosition, PlayersPosition } from "@/dtos/teamDtos";
export function findAllTeams() {
	const teams = db.query.teams.findMany({
		with: {
			conference: true,
		},
	});

	return teams;
}

export async function findTeamByUserId(userId: string) {
	const seasonQuery = db
		.select({
			id: sql<number>`max(${seasons.id})`.as("id"),
		})
		.from(seasons);

	const team = await db.query.teams.findFirst({
		where: (teams, { eq }) => eq(teams.userId, userId),
		with: {
			conference: true,
			keeps: {
				where: (keeps, { eq }) => eq(keeps.seasonId, seasonQuery),
			},
			seasonAwards: {
				where: (awards, { eq }) => eq(awards.seasonId, seasonQuery),
				with: {
					award: true,
				},
			},
		},
	});

	return team;
}

export async function findTeamIdByUserId(userId: string) {
	const team = await db
		.select({
			id: teams.id,
		})
		.from(teams)
		.where(eq(teams.userId, userId))
		.limit(1);

	if (!team) {
		throw new Error("Team not found");
	}

	const teamId = team.at(0)?.id;

	if (!teamId) {
		throw new Error("Team ID not found");
	}

	return teamId;
}

export async function findTeamById(id: string) {
	const seasonQuery = db
		.select({
			id: sql<number>`max(${seasons.id})`.as("id"),
		})
		.from(seasons);

	const team = await db.query.teams.findFirst({
		where: (teams, { eq }) => eq(teams.id, id),
		with: {
			conference: true,
			keeps: {
				where: (keeps, { eq }) => eq(keeps.seasonId, seasonQuery),
			},
			seasonAwards: {
				where: (awards, { eq }) => eq(awards.seasonId, seasonQuery),
				with: {
					award: true,
				},
			},
		},
	});

	return team;
}

export async function findAllTeamRecordsBySeason(season: number | null) {
	const seasonQuery = db
		.select({
			id: sql<number>`max(${seasons.id})`.as("id"),
		})
		.from(seasons);

	const seasonId = season ? season : seasonQuery;

	const results = await db
		.select({
			teamName: teams.name,
			teamId: teamGames.teamId,
			teamAbbreviation: teams.abbreviation,
			teamLogo: teams.logo,
			conferenceName: conferences.name,
			season: games.seasonId,
			wins: sql<number>`sum(case when ${teamGames.outcome} = 'Win' then 1 else 0 end)`,
			losses: sql<number>`sum(case when ${teamGames.outcome} = 'Loss' then 1 else 0 end)`,
		})
		.from(teamGames)
		.innerJoin(games, eq(teamGames.gameId, games.id))
		.innerJoin(teams, eq(teamGames.teamId, teams.id))
		.innerJoin(conferences, eq(teams.conferenceId, conferences.id))
		.where(eq(games.seasonId, seasonId))
		.groupBy(
			teams.name,
			teamGames.teamId,
			games.seasonId,
			teams.abbreviation,
			teams.logo,
			conferences.name
		);

	return results;
}

export async function findRosterStatsByTeam(teamId: string) {
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
		.where(and(eq(players.teamId, teamId), eq(games.seasonId, seasonQuery)))
		.groupBy(players.id);

	return stats;
}

export async function findTeamLineup(teamId: string) {
	const lineup = await db
		.select({
			playerId: players.id,
			name: players.name,
			image: players.image,
			fieldingPosition: teamLineups.fieldingPosition,
			battingPosition: teamLineups.battingOrder,
			battingOrder: teamLineups.battingOrder,
			isStarred: teamLineups.isStarred,
		})
		.from(teamLineups)
		.leftJoin(players, eq(teamLineups.playerId, players.id))
		.where(eq(players.teamId, teamId));

	return lineup;
}

export async function editFieldingLineup(lineup: PlayersPosition) {
	const updatedLineup = await db
		.update(teamLineups)
		.set({
			fieldingPosition: lineup.position,
		})
		.where(eq(teamLineups.playerId, lineup.playerId));

	return updatedLineup;
}

export async function editBattingOrder(battingOrder: BattingOrderPosition) {
	const updatedLineup = await db
		.update(teamLineups)
		.set({
			battingOrder: battingOrder.battingOrder,
		})
		.where(eq(teamLineups.playerId, battingOrder.playerId));

	return updatedLineup;
}

export async function findAllTeamAssets() {
	const seasonQuery = db
		.select({
			id: sql<number>`max(${seasons.id})`.as("id"),
		})
		.from(seasons);

	const assets = await db.query.teams.findMany({
		with: {
			players: true,
			keeps: {
				where: (keeps, { eq }) => eq(keeps.seasonId, seasonQuery),
			},
			conference: true,
		},
	});

	return assets;
}

export async function findTeamKeeps(teamId: string) {
	const seasonQuery = db
		.select({
			id: sql<number>`max(${seasons.id})`.as("id"),
		})
		.from(seasons);

	const keeps = await db.query.keepSlots.findMany({
		where: (keeps, { eq, and }) =>
			and(eq(keeps.teamId, teamId), eq(keeps.seasonId, seasonQuery)),
	});

	return keeps;
}

export async function resetTeamBattingOrder(teamId: string) {
	const teamPlayerQuery = db
		.select({
			id: players.id,
		})
		.from(players)
		.where(eq(players.teamId, teamId));

	const updatedLineup = await db
		.update(teamLineups)
		.set({
			battingOrder: null,
		})
		.where(inArray(teamLineups.playerId, teamPlayerQuery));

	return updatedLineup;
}

export async function updateKeepTeam(keepId: string, newTeamId: string) {
	const updatedKeep = await db
		.update(keepSlots)
		.set({ teamId: newTeamId })
		.where(eq(keepSlots.id, keepId))
		.returning();

	if (updatedKeep.length === 0) {
		throw new Error("Keep not found or update failed");
	}

	return updatedKeep[0];
}
