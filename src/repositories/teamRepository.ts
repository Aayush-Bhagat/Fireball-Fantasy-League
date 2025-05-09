import { sql, eq, and, sum } from "drizzle-orm";
import { db } from "@/db";
import { games, teamGames } from "@/models/games";
import { conferences, teams } from "@/models/teams";
import { seasons } from "@/models/seasons";
import { playerGamesStats, players } from "@/models/players";
import { teamLineups } from "@/models/teams";
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
