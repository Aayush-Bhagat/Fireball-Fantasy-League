import { db } from "@/db";
import { GameData } from "@/dtos/gameDtos";
import { games, teamGames } from "@/models/games";
import { playerGamesStats, players } from "@/models/players";
import { seasons } from "@/models/seasons";
import { conferences, teams } from "@/models/teams";
import { eq, and, sql, lt, ne, asc } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

export async function findGamesByWeekAndSeason(
	season: number | null,
	week: number | undefined
): Promise<GameData[]> {
	const opponent = alias(teams, "teamTwo");

	const opponentGames = alias(teamGames, "teamTwoGames");

	const seasonQuery = db
		.select({
			id: sql<number>`max(${seasons.id})`.as("id"),
		})
		.from(seasons);

	const seasonId = season ? season : seasonQuery;

	const weekId = week ? week : seasons.currentWeek;

	const result = db
		.select({
			gameId: games.id,
			playedAt: games.playedAt,
			seasonId: games.seasonId,
			week: games.week,
			teamId: teams.id,
			teamName: teams.name,
			teamLogo: teams.logo,
			teamAbbreviation: teams.abbreviation,
			teamScore: teamGames.score,
			teamOutcome: teamGames.outcome,
			opponentId: opponent.id,
			opponentName: opponent.name,
			opponentScore: opponentGames.score,
			opponentAbbreviation: opponent.abbreviation,
			opponentLogo: opponent.logo,
			opponentOutcome: opponentGames.outcome,
		})
		.from(teamGames)
		.innerJoin(games, eq(teamGames.gameId, games.id))
		.innerJoin(
			opponentGames,
			and(
				eq(opponentGames.gameId, teamGames.gameId),
				lt(opponentGames.teamId, teamGames.teamId)
			)
		)
		.innerJoin(teams, eq(teamGames.teamId, teams.id))
		.innerJoin(opponent, eq(opponentGames.teamId, opponent.id))
		.innerJoin(seasons, eq(games.seasonId, seasons.id))
		.where(and(eq(games.week, weekId), eq(games.seasonId, seasonId)))
		.orderBy(games.id);

	return result;
}

export async function findSeasonSchedule(
	season: number | null
): Promise<GameData[]> {
	const opponent = alias(teams, "teamTwo");

	const opponentGames = alias(teamGames, "teamTwoGames");

	const seasonQuery = db
		.select({
			id: sql<number>`max(${seasons.id})`.as("id"),
		})
		.from(seasons);

	const seasonId = season ? season : seasonQuery;

	const result = db
		.select({
			gameId: games.id,
			playedAt: games.playedAt,
			seasonId: games.seasonId,
			week: games.week,
			teamId: teams.id,
			teamName: teams.name,
			teamLogo: teams.logo,
			teamAbbreviation: teams.abbreviation,
			teamScore: teamGames.score,
			teamOutcome: teamGames.outcome,
			opponentId: opponent.id,
			opponentName: opponent.name,
			opponentScore: opponentGames.score,
			opponentAbbreviation: opponent.abbreviation,
			opponentLogo: opponent.logo,
			opponentOutcome: opponentGames.outcome,
		})
		.from(teamGames)
		.innerJoin(games, eq(teamGames.gameId, games.id))
		.innerJoin(
			opponentGames,
			and(
				eq(opponentGames.gameId, teamGames.gameId),
				lt(opponentGames.teamId, teamGames.teamId)
			)
		)
		.innerJoin(teams, eq(teamGames.teamId, teams.id))
		.innerJoin(opponent, eq(opponentGames.teamId, opponent.id))
		.innerJoin(seasons, eq(games.seasonId, seasons.id))
		.where(eq(games.seasonId, seasonId))
		.orderBy(games.id);

	return result;
}

export async function findTeamSchedule(
	teamId: string,
	season: number | null
): Promise<GameData[]> {
	const opponent = alias(teams, "teamTwo");

	const opponentGames = alias(teamGames, "teamTwoGames");

	const seasonQuery = db
		.select({
			id: sql<number>`max(${seasons.id})`.as("id"),
		})
		.from(seasons);

	const seasonId = season ? season : seasonQuery;

	const result = db
		.select({
			gameId: games.id,
			playedAt: games.playedAt,
			seasonId: games.seasonId,
			week: games.week,
			teamId: teams.id,
			teamName: teams.name,
			teamLogo: teams.logo,
			teamAbbreviation: teams.abbreviation,
			teamScore: teamGames.score,
			teamOutcome: teamGames.outcome,
			opponentId: opponent.id,
			opponentName: opponent.name,
			opponentScore: opponentGames.score,
			opponentAbbreviation: opponent.abbreviation,
			opponentLogo: opponent.logo,
			opponentOutcome: opponentGames.outcome,
		})
		.from(teamGames)
		.innerJoin(games, eq(teamGames.gameId, games.id))
		.innerJoin(
			opponentGames,
			and(
				eq(opponentGames.gameId, teamGames.gameId),
				ne(opponentGames.teamId, teamGames.teamId)
			)
		)
		.innerJoin(teams, eq(teamGames.teamId, teams.id))
		.innerJoin(opponent, eq(opponentGames.teamId, opponent.id))
		.innerJoin(seasons, eq(games.seasonId, seasons.id))
		.where(and(eq(games.seasonId, seasonId), eq(teamGames.teamId, teamId)))
		.orderBy(games.week, games.playedAt, games.id);

	return result;
}

export async function findPlayerGames(playerId: string) {
	const seasonQuery = db
		.select({
			id: sql<number>`max(${seasons.id})`.as("id"),
		})
		.from(seasons);

	const playerTeam = alias(teams, "playerTeam");
	const playerTeamGame = alias(teamGames, "playerTeamGame");
	const playerTeamConference = alias(conferences, "playerTeamConference");

	const opponentTeam = alias(teams, "opponentTeam");
	const opponentTeamGame = alias(teamGames, "opponentTeamGame");
	const opponentTeamConference = alias(conferences, "opponentTeamConference");

	const result = await db
		.select({
			gameId: games.id,
			week: games.week,
			playedAt: games.playedAt,

			// Player's team
			playerTeamId: playerTeam.id,
			playerTeamName: playerTeam.name,
			playerTeamAbbreviation: playerTeam.abbreviation,
			playerTeamLogo: playerTeam.logo,
			playerTeamScore: playerTeamGame.score,
			playerTeamOutcome: playerTeamGame.outcome,
			playerTeamConferenceId: playerTeamConference.id,
			playerTeamConferenceName: playerTeamConference.name,
			playerTeamUserId: playerTeam.userId,
			// Opponent team
			opponentTeamId: opponentTeam.id,
			opponentTeamName: opponentTeam.name,
			opponentTeamAbbreviation: opponentTeam.abbreviation,
			opponentTeamLogo: opponentTeam.logo,
			opponentTeamScore: opponentTeamGame.score,
			opponentTeamOutcome: opponentTeamGame.outcome,
			opponentTeamConferenceId: opponentTeamConference.id,
			opponentTeamConferenceName: opponentTeamConference.name,
			opponentTeamUserId: opponentTeam.userId,
			// Player stats
			atBats: playerGamesStats.atBats,
			hits: playerGamesStats.hits,
			runs: playerGamesStats.runs,
			rbis: playerGamesStats.rbis,
			walks: playerGamesStats.walks,
			strikeouts: playerGamesStats.strikeouts,
			homeRuns: playerGamesStats.homeRuns,
			outsPitched: playerGamesStats.outsPitched,
			runsAllowed: playerGamesStats.runsAllowed,
			outs: playerGamesStats.outs,
		})
		.from(playerGamesStats)
		.innerJoin(games, eq(playerGamesStats.gameId, games.id))
		.innerJoin(seasons, eq(games.seasonId, seasons.id))
		.innerJoin(
			playerTeamGame,
			and(
				eq(playerTeamGame.gameId, games.id),
				eq(playerTeamGame.teamId, playerGamesStats.teamId)
			)
		)
		.innerJoin(playerTeam, eq(playerTeam.id, playerGamesStats.teamId))
		.innerJoin(
			playerTeamConference,
			eq(playerTeam.conferenceId, playerTeamConference.id)
		)
		.innerJoin(players, eq(players.id, playerGamesStats.playerId))
		.innerJoin(
			opponentTeamGame,
			and(
				eq(opponentTeamGame.gameId, games.id),
				ne(opponentTeamGame.teamId, playerGamesStats.teamId)
			)
		)
		.innerJoin(opponentTeam, eq(opponentTeam.id, opponentTeamGame.teamId))
		.innerJoin(
			opponentTeamConference,
			eq(opponentTeam.conferenceId, opponentTeamConference.id)
		)
		.where(
			and(
				eq(playerGamesStats.playerId, playerId),
				eq(seasons.id, seasonQuery)
			)
		)
		.orderBy(asc(games.week), asc(games.playedAt));

	return result;
}
