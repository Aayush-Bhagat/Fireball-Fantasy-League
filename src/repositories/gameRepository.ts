import { db } from "@/db";
import { GameData } from "@/dtos/gameDtos";
import { games, teamGames } from "@/models/games";
import { playerGamesStats, players } from "@/models/players";
import { seasons } from "@/models/seasons";
import { conferences, teams } from "@/models/teams";
import { eq, and, sql, lt, ne } from "drizzle-orm";
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
	const playerTeamGames = alias(teamGames, "playerTeamGames");
	const playerTeamConference = alias(conferences, "playerTeamConference");
	const opponentTeam = alias(teams, "opponentTeam");
	const opponentTeamGames = alias(teamGames, "opponentTeamGames");
	const opponentTeamConference = alias(conferences, "opponentTeamConference");

	const result = db
		.select({
			gameId: games.id,
			week: games.week,
			playedAt: games.playedAt,
			teamId: playerTeam.id,
			teamName: playerTeam.name,
			teamLogo: playerTeam.logo,
			teamAbbreviation: playerTeam.abbreviation,
			teamConference: playerTeamConference.name,
			teamUserId: playerTeam.userId,
			opponentId: opponentTeam.id,
			opponentName: opponentTeam.name,
			opponentLogo: opponentTeam.logo,
			opponentAbbreviation: opponentTeam.abbreviation,
			opponentConference: opponentTeamConference.name,
			opponentUserId: opponentTeam.userId,
			teamScore: playerTeamGames.score,
			teamOutcome: playerTeamGames.outcome,
			opponentScore: opponentTeamGames.score,
			opponentOutcome: opponentTeamGames.outcome,
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
		.innerJoin(players, eq(playerGamesStats.playerId, players.id))
		.innerJoin(playerTeam, eq(players.teamId, playerTeam.id))
		.innerJoin(
			playerTeamConference,
			eq(playerTeam.conferenceId, playerTeamConference.id)
		)
		.innerJoin(
			playerTeamGames,
			and(
				eq(playerTeamGames.gameId, games.id),
				eq(playerTeamGames.teamId, playerGamesStats.teamId)
			)
		)
		.innerJoin(
			opponentTeamGames,
			and(
				eq(opponentTeamGames.gameId, games.id),
				ne(opponentTeamGames.teamId, playerGamesStats.teamId)
			)
		)
		.innerJoin(opponentTeam, eq(opponentTeam.id, opponentTeamGames.teamId))
		.innerJoin(
			opponentTeamConference,
			eq(opponentTeam.conferenceId, opponentTeamConference.id)
		)
		.where(and(eq(players.id, playerId), eq(games.seasonId, seasonQuery)))
		.orderBy(games.week, games.playedAt);

	return result;
}
