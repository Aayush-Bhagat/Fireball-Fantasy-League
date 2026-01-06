import { Season } from "./../models/seasons";

export type SeasonDto = {
	id: number;
	startDate: Date;
	endDate: Date | null;
	currentWeek: number;
};

export type SeasonResponseDto = {
	seasons: SeasonDto[];
};
