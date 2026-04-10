import { DraftStatusEnum } from "@/models/draft";

export type DraftResponseDto = {
	teamId: string;
	draft: DraftDto;
};

export type DraftDto = {
	id: string;
	seasonId: number | null;
	status: DraftStatusEnum;
	currentPickId: string | null;
	commissionerId: string | null;
	draftPicks: {
		round: number;
		picks: FullDraftPicks[];
	}[];
	draftOrder: {
		draftId: string;
		teamId: string;
		pickNumber: number;
		team: {
			id: string;
			name: string;
			userId: string;
			logo: string | null;
			conferenceId: number;
			abbreviation: string;
		};
	}[];
};

export type FullDraftPicks = {
	id: string;
	teamId: string;
	seasonId: number;
	originalTeamId: string;
	draftId: string;
	round: number;
	pick: number | null;
	overallPick: number | null;
	selection: string | null;
	isCompensatory: boolean;
	tradeable: boolean;
	team: {
		id: string;
		name: string;
		userId: string;
		logo: string | null;
		conferenceId: number;
		abbreviation: string;
	};
	originalTeam: {
		id: string;
		name: string;
		userId: string;
		logo: string | null;
		conferenceId: number;
		abbreviation: string;
	};
	playerSelected: {
		id: string;
		name: string;
		teamId: string | null;
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
	} | null;
};
