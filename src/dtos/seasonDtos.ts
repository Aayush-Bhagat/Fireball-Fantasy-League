import { SeasonPhaseEnum, SeasonStatusEnum } from "@/models/seasons";

export type SeasonDto = {
	id: number;
	startDate: Date;
	endDate: Date | null;
	currentWeek: number;
	status: SeasonStatusEnum;
	phase: SeasonPhaseEnum;
};

export type SeasonResponseDto = {
	seasons: SeasonDto[];
};
