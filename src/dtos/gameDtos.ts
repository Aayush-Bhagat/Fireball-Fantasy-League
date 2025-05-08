import { TeamDto, TeamGameDto } from "./teamDtos";
import { BasicPlayerDto, BasicPlayerStatsDto } from "./playerDtos";
import { z } from "zod";

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

export type AdminGameDto = {
	gameId: string;
	seasonId: number;
	week: number;
	playedAt: Date | null;
	team: TeamGameDto;
	opponent: TeamGameDto;
	teamRoster: BasicPlayerDto[];
	opponentRoster: BasicPlayerDto[];
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

export const UpdatePlayerGameStatsSchema = z.object({
	playerId: z.string(),
	atBats: z.number().int().nonnegative(),
	hits: z.number().int().nonnegative(),
	runs: z.number().int().nonnegative(),
	rbis: z.number().int().nonnegative(),
	walks: z.number().int().nonnegative(),
	strikeouts: z.number().int().nonnegative(),
	homeRuns: z.number().int().nonnegative(),
	outsPitched: z.number().int().nonnegative(),
	runsAllowed: z.number().int().nonnegative(),
	outs: z.number().int().nonnegative(),
});

export const UpdateGameRequestSchema = z.object({
	gameId: z.string(),
	teamId: z.string(),
	opponentId: z.string(),
	teamScore: z.number().int().nonnegative(),
	opponentScore: z.number().int().nonnegative(),
	teamPlayers: z.array(UpdatePlayerGameStatsSchema).min(9),
	opponentPlayers: z.array(UpdatePlayerGameStatsSchema).min(9),
});

export type UpdateGameRequestDto = z.infer<typeof UpdateGameRequestSchema>;
export type UpdatePlayerGameStatsDto = z.infer<
	typeof UpdatePlayerGameStatsSchema
>;

export type GameStatsDto = {
	gameId: string;
	team: TeamDto;
	opponent: TeamDto;
	teamScore: number | null;
	opponentScore: number | null;
	teamOutcome: string | null;
	opponentOutcome: string | null;
	teamPlayers: BasicPlayerStatsDto[];
	opponentPlayers: BasicPlayerStatsDto[];
};
