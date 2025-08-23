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

export type TeamAward = {
	seasonId: number;
	awardId: string;
	playerId: string | null;
	teamId: string | null;
	awardedAt: Date;
	id: string;
	award: {
		id: string;
		name: string;
		description: string;
		category: string;
		icon: string | null;
	};
};

export type TeamAwardsResponse = {
	awards: TeamAward[];
};
