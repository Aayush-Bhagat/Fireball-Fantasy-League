export type PlayerAward = {
	awardId: string;
	name: string;
	description: string;
	category: string;
	icon: string | null;
	wins: {
		seasonId: number;
		awardedAt: Date;
		seasonStart: Date;
		seasonEnd: Date | null;
		currentWeek: number;
	}[];
};

export type PlayerAwardsResponse = {
	awards: PlayerAward[];
};
