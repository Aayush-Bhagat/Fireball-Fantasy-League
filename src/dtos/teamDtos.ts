import { PlayerWithStatsDto } from "./playerDtos";

export type teamResponseDto = {
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
	value: string;
	seasonId: number;
	originalTeamId: string;
};

export type TeamWithKeepsDto = {
	team: TeamDto;
	keeps: KeepDto[];
};
