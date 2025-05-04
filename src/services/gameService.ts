import { SeasonScheduleResponseDto } from "./../dtos/gameDtos";
import {
	findGamesByWeekAndSeason,
	findSeasonSchedule,
} from "@/repositories/gameRepository";
import { GameDtoMapper, mapToSeasonSchedule } from "@/lib/mappers/gameMappers";
import { findAllTeamRecordsBySeason } from "@/repositories/teamRepository";

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
