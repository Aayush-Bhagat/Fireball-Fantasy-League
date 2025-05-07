import {
	AdminGameDto,
	SeasonScheduleResponseDto,
	UpdateGameRequestDto,
} from "./../dtos/gameDtos";
import {
	createPlayerGameStats,
	findGameById,
	findGamesByWeekAndSeason,
	findSeasonSchedule,
	updateTeamGameById,
} from "@/repositories/gameRepository";
import { GameDtoMapper, mapToSeasonSchedule } from "@/lib/mappers/gameMappers";
import { findAllTeamRecordsBySeason } from "@/repositories/teamRepository";
import { findPlayersByTeamId } from "@/repositories/playerRepository";

export async function getGamesByWeekAndSeason(
	week: number | undefined,
	season: string | undefined
) {
	if ((season !== "current" && isNaN(Number(season))) || !season) {
		throw new Error("Invalid season");
	}

	const seasonId = season === "current" ? null : parseInt(season);

	const games = await findGamesByWeekAndSeason(seasonId, week);

	const records = await findAllTeamRecordsBySeason(seasonId);

	const gamesWithRecords = GameDtoMapper(games, records);

	return gamesWithRecords;
}

export async function getSeasonSchedule(
	season: string | undefined
): Promise<SeasonScheduleResponseDto> {
	if ((season !== "current" && isNaN(Number(season))) || !season) {
		throw new Error("Invalid season");
	}

	const seasonId = season === "current" ? null : parseInt(season);

	const schedule = await findSeasonSchedule(seasonId);

	const records = await findAllTeamRecordsBySeason(seasonId);

	const seasonSchedule = mapToSeasonSchedule(schedule, records);

	const seasonNumber = schedule.at(0)?.seasonId || 0;

	return {
		season: seasonNumber,
		schedule: seasonSchedule,
	};
}

export async function getGameById(gameId: string) {
	const games = await findGameById(gameId);

	const game = games.at(0);

	if (!game) {
		throw new Error("Game not found");
	}

	const teamPlayers = await findPlayersByTeamId(game.teamId);

	const opponentPlayers = await findPlayersByTeamId(game.opponentId);

	const gameDto: AdminGameDto = {
		gameId: game.gameId,
		playedAt: game.playedAt,
		seasonId: game.seasonId,
		week: game.week,
		team: {
			id: game.teamId,
			name: game.teamName,
			logo: game.teamLogo,
			abbreviation: game.teamAbbreviation,
		},
		opponent: {
			id: game.opponentId,
			name: game.opponentName,
			logo: game.opponentLogo,
			abbreviation: game.opponentAbbreviation,
		},
		teamRoster: teamPlayers.map((player) => ({
			id: player.id,
			name: player.name,
			image: player.image,
		})),
		opponentRoster: opponentPlayers.map((player) => ({
			id: player.id,
			name: player.name,
			image: player.image,
		})),
	};

	return gameDto;
}

export const updateGame = async (game: UpdateGameRequestDto) => {
	try {
		const teamOutcome =
			game.teamScore > game.opponentScore ? "Win" : "Loss";
		const opponentOutcome =
			game.opponentScore > game.teamScore ? "Win" : "Loss";

		await updateTeamGameById(
			game.gameId,
			game.teamId,
			game.teamScore,
			teamOutcome
		);
		await updateTeamGameById(
			game.gameId,
			game.opponentId,
			game.opponentScore,
			opponentOutcome
		);
		await createPlayerGameStats(game.teamPlayers, game.teamId, game.gameId);
		await createPlayerGameStats(
			game.opponentPlayers,
			game.opponentId,
			game.gameId
		);
	} catch (error) {
		console.error(error);
		throw error;
	}
};
