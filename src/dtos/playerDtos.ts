import { TeamDto } from "./teamDtos";

export type PlayerDto = {
	id: string;
	name: string;
	team: TeamDto | null;
	image: string | null;
	isCaptain: boolean;
	batting: number;
	pitching: number;
	running: number;
	fielding: number;
	starSwing: string | null;
	starPitch: string | null;
	fieldingAbility: string;
};

export type BasicPlayerDto = {
	id: string;
	name: string;
	image: string | null;
};

export type PlayerStatsResponseDto = {
	players: PlayerWithStatsDto[];
};

export type PlayerStatsDto = {
	atBats: number;
	hits: number;
	runs: number;
	rbis: number;
	walks: number;
	strikeouts: number;
	homeRuns: number;
	inningsPitched: number;
	runsAllowed: number;
	outs: number;
	battingAverage: number;
	era: number;
};

export type BasicPlayerStatsDto = {
	playerId: string;
	playerName: string;
	playerImage: string | null;
	atBats: number;
	hits: number;
	runs: number;
	rbis: number;
	walks: number;
	strikeouts: number;
	homeRuns: number;
	inningsPitched: number;
	runsAllowed: number;
	outs: number;
	battingAverage: number;
	era: number;
};

export type PlayerWithStatsDto = {
	id: string;
	name: string;
	team: TeamDto | null;
	image: string | null;
	isCaptain: boolean;
	batting: number;
	pitching: number;
	running: number;
	fielding: number;
	starSwing: string | null;
	starPitch: string | null;
	fieldingAbility: string | null;
	playerCardImage: string | null;
	stats: PlayerStatsDto;
};

export type PlayerGameStatsDto = {
	gameId: string;
	week: number;
	playedAt: Date | null;
	team: TeamDto;
	opponent: TeamDto;
	teamScore: number | null;
	opponentScore: number | null;
	teamOutcome: string | null;
	opponentOutcome: string | null;
	stats: PlayerStatsDto;
};

export type PlayerGameResponseDto = {
	games: PlayerGameStatsDto[];
};

export type PlayerHistoryDto = {
	id: string;
	teamId: string;
	seasonId: number;
	tradeId: string | null;
	playerId: string;
	draftRound: number | null;
	draftPick: number | null;
	type: "Draft" | "Trade";
	createdAt: Date;
	team: TeamDto;
};

export type PlayerHistoryResponseDto = {
	history: PlayerHistoryDto[];
};

export type CareerStatsDto = {
	seasonId: number;
	playerId: string;
	playerName: string;
	homeRuns: number;
	atBats: number;
	hits: number;
	runs: number;
	rbis: number;
	walks: number;
	strikeouts: number;
	inningsPitched: number;
	runsAllowed: number;
	outs: number;
	battingAverage: number;
	era: number;
	teamsPlayedFor: string[] | null;
};

export type PlayerCareerStatsDto = {
	id: string;
	name: string;
	team: TeamDto | null;
	image: string | null;
	isCaptain: boolean;
	batting: number;
	pitching: number;
	running: number;
	fielding: number;
	starSwing: string | null;
	starPitch: string | null;
	fieldingAbility: string | null;
	careerStats: CareerStatsDto[];
};
