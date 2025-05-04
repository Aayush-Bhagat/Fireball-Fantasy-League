import { TeamGameDto } from "./teamDtos";

export type GameResponseDto = {
	games: GameDto[];
};

export type GameDto = {
	gameId: string;
	season: number;
	week: number;
	playedAt: Date | null;
	team: TeamGameDto;
	teamWins: number;
	teamLosses: number;
	opponent: TeamGameDto;
	opponentWins: number;
	opponentLosses: number;
	teamScore: number | null;
	opponentScore: number | null;
	teamOutcome: string | null;
	opponentOutcome: string | null;
};

export type SeasonScheduleResponseDto = {
	season: number;
	schedule: SeasonScheduleDto[];
};

export type SeasonScheduleDto = {
	week: number;
	games: GameDto[];
};

export type GameData = {
	gameId: string;
	seasonId: number;
	week: number;
	playedAt: Date | null;
	teamId: string;
	teamName: string;
	teamLogo: string | null;
	teamAbbreviation: string;
	opponentId: string;
	opponentName: string;
	opponentLogo: string | null;
	opponentAbbreviation: string;
	teamScore: number | null;
	opponentScore: number | null;
	teamOutcome: string | null;
	opponentOutcome: string | null;
};
