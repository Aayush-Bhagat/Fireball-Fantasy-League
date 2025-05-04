import { GameDto, SeasonScheduleDto } from "@/dtos/gameDtos";
import { GameData } from "@/dtos/gameDtos";
import { buildTeamRecordsMap } from "./teamMappers";
import { TeamRecord } from "@/dtos/teamDtos";

export function GameDtoMapper(
	games: GameData[],
	records: TeamRecord[]
): GameDto[] {
	const teamRecords = buildTeamRecordsMap(records);

	return games.map((game) => {
		const teamRecord = teamRecords[game.teamId];
		const opponentRecord = teamRecords[game.opponentId];

		return {
			gameId: game.gameId,
			season: game.seasonId,
			week: game.week,
			playedAt: game.playedAt,
			team: {
				id: game.teamId,
				name: game.teamName,
				logo: game.teamLogo,
				abbreviation: game.teamAbbreviation,
			},
			teamWins: teamRecord?.wins ?? 0,
			teamLosses: teamRecord?.losses ?? 0,
			opponent: {
				id: game.opponentId,
				name: game.opponentName,
				logo: game.opponentLogo,
				abbreviation: game.opponentAbbreviation,
			},
			opponentWins: opponentRecord?.wins ?? 0,
			opponentLosses: opponentRecord?.losses ?? 0,
			teamScore: game.teamScore,
			opponentScore: game.opponentScore,
			teamOutcome: game.teamOutcome,
			opponentOutcome: game.opponentOutcome,
		};
	});
}

export function mapToSeasonSchedule(
	games: GameData[],
	records: TeamRecord[]
): SeasonScheduleDto[] {
	// First convert all games to GameDto format
	const gameDtos = GameDtoMapper(games, records);

	// Group games by week
	const gamesByWeek = gameDtos.reduce<Record<number, GameDto[]>>(
		(acc, game) => {
			if (!acc[game.week]) {
				acc[game.week] = [];
			}
			acc[game.week].push(game);
			return acc;
		},
		{}
	);

	// Convert to SeasonScheduleDto array
	const schedule = Object.entries(gamesByWeek).map(([week, games]) => ({
		week: parseInt(week),
		games,
	}));

	// Sort by week number
	schedule.sort((a, b) => a.week - b.week);

	return schedule;
}
