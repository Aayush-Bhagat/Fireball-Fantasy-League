import {
	InsertGameInning,
	StadiumTime,
	UpdatePlayerGameStatsDto,
} from "./../dtos/gameDtos";
import { db } from "@/db";
import { GameData } from "@/dtos/gameDtos";
import { gameInnings, games, stadiums, teamGames } from "@/models/games";
import { playerGamesStats, players } from "@/models/players";
import { seasons } from "@/models/seasons";
import { conferences, teams } from "@/models/teams";
import { eq, and, ne, asc, isNull, gt, or } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

export async function findGamesByWeekAndSeason(
	season: number | null,
	week: number | undefined,
): Promise<GameData[]> {
	const opponent = alias(teams, "teamTwo");
	const opponentGames = alias(teamGames, "teamTwoGames");
	const bannedStadium = alias(stadiums, "bannedStadium");

	const seasonQuery = db
		.select({
			id: seasons.id,
		})
		.from(seasons)
		.where(eq(seasons.status, "in_progress"));

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
			teamSide: teamGames.side,

			opponentId: opponent.id,
			opponentName: opponent.name,
			opponentScore: opponentGames.score,
			opponentAbbreviation: opponent.abbreviation,
			opponentLogo: opponent.logo,
			opponentOutcome: opponentGames.outcome,
			opponentSide: opponentGames.side,

			stadiumTime: games.stadiumTime,
			stadiumId: stadiums.id,
			stadiumName: stadiums.name,
			stadiumIcon: stadiums.icon,
			stadiumBanner: stadiums.banner,
			bannedStadiumId: bannedStadium.id,
			bannedStadiumName: bannedStadium.name,
			bannedStadiumIcon: bannedStadium.icon,
			bannedStadiumBanner: bannedStadium.banner,
		})
		.from(teamGames)
		.innerJoin(games, eq(teamGames.gameId, games.id))
		.innerJoin(
			opponentGames,
			and(
				eq(opponentGames.gameId, teamGames.gameId),

				or(
					and(
						eq(teamGames.side, "Home"),
						eq(opponentGames.side, "Away"),
					),
					and(
						isNull(teamGames.side),
						isNull(opponentGames.side),
						gt(teamGames.teamId, opponentGames.teamId),
					),
				),
			),
		)
		.innerJoin(teams, eq(teamGames.teamId, teams.id))
		.innerJoin(opponent, eq(opponentGames.teamId, opponent.id))
		.innerJoin(seasons, eq(games.seasonId, seasons.id))
		.leftJoin(stadiums, eq(games.stadiumId, stadiums.id))
		.leftJoin(bannedStadium, eq(games.bannedStadiumId, bannedStadium.id))
		.where(and(eq(games.week, weekId), eq(games.seasonId, seasonId)))
		.orderBy(games.id);

	return result;
}

export async function findSeasonSchedule(
	season: number | null,
): Promise<GameData[]> {
	const opponent = alias(teams, "teamTwo");

	const opponentGames = alias(teamGames, "teamTwoGames");
	const bannedStadium = alias(stadiums, "bannedStadium");

	const seasonQuery = db
		.select({
			id: seasons.id,
		})
		.from(seasons)
		.where(eq(seasons.status, "in_progress"));

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
			teamSide: teamGames.side,
			opponentId: opponent.id,
			opponentName: opponent.name,
			opponentScore: opponentGames.score,
			opponentAbbreviation: opponent.abbreviation,
			opponentLogo: opponent.logo,
			opponentOutcome: opponentGames.outcome,
			opponentSide: opponentGames.side,

			stadiumTime: games.stadiumTime,
			stadiumId: stadiums.id,
			stadiumName: stadiums.name,
			stadiumIcon: stadiums.icon,
			stadiumBanner: stadiums.banner,
			bannedStadiumId: bannedStadium.id,
			bannedStadiumName: bannedStadium.name,
			bannedStadiumIcon: bannedStadium.icon,
			bannedStadiumBanner: bannedStadium.banner,
		})
		.from(teamGames)
		.innerJoin(games, eq(teamGames.gameId, games.id))
		.innerJoin(
			opponentGames,
			and(
				eq(opponentGames.gameId, teamGames.gameId),

				or(
					and(
						eq(teamGames.side, "Home"),
						eq(opponentGames.side, "Away"),
					),
					and(
						isNull(teamGames.side),
						isNull(opponentGames.side),
						gt(teamGames.teamId, opponentGames.teamId),
					),
				),
			),
		)
		.innerJoin(teams, eq(teamGames.teamId, teams.id))
		.innerJoin(opponent, eq(opponentGames.teamId, opponent.id))
		.innerJoin(seasons, eq(games.seasonId, seasons.id))
		.leftJoin(stadiums, eq(games.stadiumId, stadiums.id))
		.leftJoin(bannedStadium, eq(games.bannedStadiumId, bannedStadium.id))
		.where(eq(games.seasonId, seasonId))
		.orderBy(games.id, teamGames.side, opponentGames.side);

	return result;
}

export async function findTeamSchedule(
	teamId: string,
	season: number | null,
): Promise<GameData[]> {
	const opponent = alias(teams, "teamTwo");

	const opponentGames = alias(teamGames, "teamTwoGames");
	const bannedStadium = alias(stadiums, "bannedStadium");

	const seasonQuery = db
		.select({
			id: seasons.id,
		})
		.from(seasons)
		.where(eq(seasons.status, "in_progress"));

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
			teamSide: teamGames.side,
			opponentId: opponent.id,
			opponentName: opponent.name,
			opponentScore: opponentGames.score,
			opponentAbbreviation: opponent.abbreviation,
			opponentLogo: opponent.logo,
			opponentOutcome: opponentGames.outcome,
			opponentSide: opponentGames.side,

			stadiumTime: games.stadiumTime,
			stadiumId: stadiums.id,
			stadiumName: stadiums.name,
			stadiumIcon: stadiums.icon,
			stadiumBanner: stadiums.banner,
			bannedStadiumId: bannedStadium.id,
			bannedStadiumName: bannedStadium.name,
			bannedStadiumIcon: bannedStadium.icon,
			bannedStadiumBanner: bannedStadium.banner,
		})
		.from(teamGames)
		.innerJoin(games, eq(teamGames.gameId, games.id))
		.innerJoin(
			opponentGames,
			and(
				eq(opponentGames.gameId, teamGames.gameId),

				or(
					and(
						eq(teamGames.side, "Home"),
						eq(opponentGames.side, "Away"),
					),
					and(
						isNull(teamGames.side),
						isNull(opponentGames.side),
						gt(teamGames.teamId, opponentGames.teamId),
					),
				),
			),
		)
		.innerJoin(teams, eq(teamGames.teamId, teams.id))
		.innerJoin(opponent, eq(opponentGames.teamId, opponent.id))
		.innerJoin(seasons, eq(games.seasonId, seasons.id))
		.leftJoin(stadiums, eq(games.stadiumId, stadiums.id))
		.leftJoin(bannedStadium, eq(games.bannedStadiumId, bannedStadium.id))
		.where(
			and(
				eq(games.seasonId, seasonId),
				or(
					eq(teamGames.teamId, teamId),
					eq(opponentGames.teamId, teamId),
				),
			),
		)
		.orderBy(games.week, games.playedAt, games.id);

	return result;
}

export async function findPlayerGames(playerId: string, season?: string) {
	const seasonQuery = db
		.select({
			id: seasons.id,
		})
		.from(seasons)
		.where(eq(seasons.status, "in_progress"));

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
			playerId: players.id,
			playerName: players.name,
			playerImage: players.image,

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

			// Player stats - batting
			atBats: playerGamesStats.atBats,
			hits: playerGamesStats.hits,
			runs: playerGamesStats.runs,
			rbis: playerGamesStats.rbis,
			walks: playerGamesStats.walks,
			strikeouts: playerGamesStats.strikeouts,
			homeRuns: playerGamesStats.homeRuns,
			walksTaken: playerGamesStats.walksTaken,
			plateAppearances: playerGamesStats.plateAppearances,
			strikeoutsBatted: playerGamesStats.strikeoutsBatted,
			hitByPitch: playerGamesStats.hitByPitch,
			singles: playerGamesStats.singles,
			doubles: playerGamesStats.doubles,
			triples: playerGamesStats.triples,
			oneHr: playerGamesStats.oneHr,
			twoHr: playerGamesStats.twoHr,
			threeHr: playerGamesStats.threeHr,
			grandSlams: playerGamesStats.grandSlams,
			totalBases: playerGamesStats.totalBases,
			sacFlies: playerGamesStats.sacFlies,
			startHits: playerGamesStats.startHits,
			starsUsedBatting: playerGamesStats.starsUsedBatting,

			// Player stats - baserunning
			stolenBases: playerGamesStats.stolenBases,
			caughtStealing: playerGamesStats.caughtStealing,
			stealAttempts: playerGamesStats.stealAttempts,

			// Player stats - fielding
			assist: playerGamesStats.assist,
			buddyJumpPutouts: playerGamesStats.buddyJumpPutouts,
			buddyJumpAttempts: playerGamesStats.buddyJumpAttempts,
			doublePlays: playerGamesStats.doublePlays,
			triplePlays: playerGamesStats.triplePlays,
			bobbles: playerGamesStats.bobbles,

			// Player stats - pitching
			outsPitched: playerGamesStats.outsPitched,
			runsAllowed: playerGamesStats.runsAllowed,
			outs: playerGamesStats.outs,
			battersFaced: playerGamesStats.battersFaced,
			pitches: playerGamesStats.pitches,
			strikes: playerGamesStats.strikes,
			balls: playerGamesStats.balls,
			beanBalls: playerGamesStats.beanBalls,
			hitsAllowed: playerGamesStats.hitsAllowed,
			singlesAllowed: playerGamesStats.singlesAllowed,
			doublesAllowed: playerGamesStats.doublesAllowed,
			triplesAllowed: playerGamesStats.triplesAllowed,
			homeRunsAllowed: playerGamesStats.homeRunsAllowed,
			inheritedRuns: playerGamesStats.inheritedRuns,
			starPitches: playerGamesStats.starPitches,
			starsUsedPitching: playerGamesStats.starsUsedPitching,
			pickoffs: playerGamesStats.pickoffs,
			pickoffAttempts: playerGamesStats.pickoffAttempts,
			position: playerGamesStats.position,
			battingOrder: playerGamesStats.battingOrder,
		})
		.from(playerGamesStats)
		.innerJoin(games, eq(playerGamesStats.gameId, games.id))
		.innerJoin(seasons, eq(games.seasonId, seasons.id))
		.innerJoin(
			playerTeamGame,
			and(
				eq(playerTeamGame.gameId, games.id),
				eq(playerTeamGame.teamId, playerGamesStats.teamId),
			),
		)
		.innerJoin(playerTeam, eq(playerTeam.id, playerGamesStats.teamId))
		.innerJoin(
			playerTeamConference,
			eq(playerTeam.conferenceId, playerTeamConference.id),
		)
		.innerJoin(players, eq(players.id, playerGamesStats.playerId))
		.innerJoin(
			opponentTeamGame,
			and(
				eq(opponentTeamGame.gameId, games.id),
				ne(opponentTeamGame.teamId, playerGamesStats.teamId),
			),
		)
		.innerJoin(opponentTeam, eq(opponentTeam.id, opponentTeamGame.teamId))
		.innerJoin(
			opponentTeamConference,
			eq(opponentTeam.conferenceId, opponentTeamConference.id),
		)
		.where(
			and(
				eq(playerGamesStats.playerId, playerId),
				eq(seasons.id, season ? Number(season) : seasonQuery),
			),
		)
		.orderBy(asc(games.week), asc(games.playedAt));

	return result;
}

export async function findGameById(gameId: string) {
	const bannedStadium = alias(stadiums, "bannedStadium");
	const opponent = alias(teams, "teamTwo");

	const opponentGames = alias(teamGames, "teamTwoGames");

	const teamConference = alias(conferences, "teamConference");
	const opponentConference = alias(conferences, "opponentConference");

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
			teamSide: teamGames.side,
			teamConference: teamConference.name,
			teamUserId: teams.userId,
			opponentId: opponent.id,
			opponentName: opponent.name,
			opponentScore: opponentGames.score,
			opponentAbbreviation: opponent.abbreviation,
			opponentLogo: opponent.logo,
			opponentOutcome: opponentGames.outcome,
			opponentSide: opponentGames.side,
			opponentConference: opponentConference.name,
			opponentUserId: opponent.userId,
			stadiumTime: games.stadiumTime,
			stadiumId: stadiums.id,
			stadiumName: stadiums.name,
			stadiumIcon: stadiums.icon,
			stadiumBanner: stadiums.banner,
			bannedStadiumId: bannedStadium.id,
			bannedStadiumName: bannedStadium.name,
			bannedStadiumIcon: bannedStadium.icon,
			bannedStadiumBanner: bannedStadium.banner,
		})
		.from(teamGames)
		.innerJoin(games, eq(teamGames.gameId, games.id))
		.innerJoin(
			opponentGames,
			and(
				eq(opponentGames.gameId, teamGames.gameId),

				or(
					and(
						eq(teamGames.side, "Home"),
						eq(opponentGames.side, "Away"),
					),
					and(
						isNull(teamGames.side),
						isNull(opponentGames.side),
						gt(teamGames.teamId, opponentGames.teamId),
					),
				),
			),
		)
		.innerJoin(teams, eq(teamGames.teamId, teams.id))
		.innerJoin(opponent, eq(opponentGames.teamId, opponent.id))
		.innerJoin(seasons, eq(games.seasonId, seasons.id))
		.innerJoin(teamConference, eq(teams.conferenceId, teamConference.id))
		.leftJoin(stadiums, eq(games.stadiumId, stadiums.id))
		.leftJoin(bannedStadium, eq(games.bannedStadiumId, bannedStadium.id))
		.innerJoin(
			opponentConference,
			eq(opponent.conferenceId, opponentConference.id),
		)
		.where(eq(games.id, gameId))
		.limit(1);

	return result;
}

export async function findTeamGameStats(gameId: string, teamId: string) {
	const result = await db.query.playerGamesStats.findMany({
		where: and(
			eq(playerGamesStats.gameId, gameId),
			eq(playerGamesStats.teamId, teamId),
		),
		with: {
			player: true,
		},
	});

	return result;
}
export async function updateTeamGameById(
	gameId: string,
	teamId: string,
	score: number,
	outcome: "Win" | "Loss" | "Tie",
) {
	const game = await db
		.update(teamGames)
		.set({
			score: score,
			outcome: outcome,
		})
		.where(and(eq(teamGames.gameId, gameId), eq(teamGames.teamId, teamId)));

	return game;
}

export async function createPlayerGameStats(
	playerStats: UpdatePlayerGameStatsDto[],
	teamId: string,
	gameId: string,
) {
	try {
		const playerGameStats = playerStats.map((stat) => ({
			playerId: stat.playerId,
			gameId: gameId,
			teamId: teamId,
			atBats: stat.atBats,
			hits: stat.hits,
			runs: stat.runs,
			rbis: stat.rbis,
			walks: stat.walks,
			strikeouts: stat.strikeouts,
			homeRuns: stat.homeRuns,
			outsPitched: stat.outsPitched,
			runsAllowed: stat.runsAllowed,
			outs: stat.outs,
		}));

		const results = await db
			.insert(playerGamesStats)
			.values(playerGameStats);

		return results;
	} catch (error) {
		console.error(error);
		throw error;
	}
}

export async function findStadiums() {
	const stadiums = await db.query.stadiums.findMany();

	return stadiums;
}

export async function updateGameStadium(
	gameId: string,
	gameStadiums: {
		stadiumId: string;
		bannedStadiumId: string;
		stadiumTime: StadiumTime;
	},
) {
	await db
		.update(games)
		.set({
			stadiumId: gameStadiums.stadiumId,
			bannedStadiumId: gameStadiums.bannedStadiumId,
			stadiumTime: gameStadiums.stadiumTime,
		})
		.where(eq(games.id, gameId));
}

export async function findGameInnings(gameId: string) {
	return await db.query.gameInnings.findMany({
		where: eq(gameInnings.gameId, gameId),
		orderBy: [asc(gameInnings.inning), asc(gameInnings.half)],
	});
}

export async function insertGameInnings(data: InsertGameInning[]) {
	const innings = await db
		.insert(gameInnings)
		.values(
			data.map((inning) => ({
				gameId: inning.gameId,
				teamId: inning.teamId,
				inning: inning.inning,
				half: inning.half,
				runs: inning.runs,
			})),
		)
		.returning();

	return innings;
}
