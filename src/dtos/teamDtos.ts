import { BasicPlayerDto, PlayerWithStatsDto } from "./playerDtos";

export type TeamResponseDto = {
	teams: TeamDto[];
};

export type TeamDto = {
	id: string;
	name: string;
	logo: string | null;
	abbreviation: string;
	conference: string;
	userId: string;
};

export type StandingsDto = {
	eastern: TeamStandingsDto[];
	western: TeamStandingsDto[];
};

export type TeamStandingsDto = {
	id: string;
	name: string;
	abbreviation: string;
	logo: string | null;
	conference: string;
	wins: number;
	losses: number;
	season: number;
};

export type TeamGameDto = {
	id: string;
	name: string;
	logo: string | null;
	abbreviation: string;
};

export type TeamRecord = {
	teamId: string;
	wins: number;
	losses: number;
};

export type TeamRecordMap = {
	[key: string]: {
		wins: number;
		losses: number;
	};
};

export type TeamRosterDto = {
	roster: PlayerWithStatsDto[];
};

export type KeepDto = {
	id: string;
	teamId: string;
	odds: string;
	value: number;
	seasonId: number;
	originalTeamId: string;
};

export type TeamWithKeepsDto = {
	team: TeamDto;
	keeps: KeepDto[];
};

export type TeamLineupPosition =
	| "P"
	| "C"
	| "1B"
	| "2B"
	| "3B"
	| "SS"
	| "LF"
	| "CF"
	| "RF";

export type TeamLineupDto = {
	fieldingLineup: FieldingLineupDto;
	battingOrder: BattingOrderDto;
	starredPlayer: BasicPlayerDto | null;
};

export type FieldingLineupDto = {
	[key in TeamLineupPosition]: BasicPlayerDto | null;
};

export type BattingOrderDto = Array<BasicPlayerDto | null>;
