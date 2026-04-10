import { DraftResponseDto } from "@/dtos/draftDtos";
import { findDraft } from "@/repositories/draft";
import { findTeamByUserId } from "@/repositories/teamRepository";

export async function getDraft(userId: string, draftId: string) {
	const draftData = await findDraft(draftId);
	const team = await findTeamByUserId(userId);

	if (!draftData) {
		throw new Error("Draft not found");
	}

	if (!team) {
		throw new Error("Team not found for user");
	}

	const draftPicks = draftData.draftPicks;

	const rounds = new Set(draftPicks.map((pick) => pick.round));

	const roundsList = Array.from(rounds).sort((a, b) => a - b);

	const picksPerRound = roundsList.map((round) => {
		const picksInRound = draftPicks.filter((pick) => pick.round === round);
		return {
			round,
			picks: picksInRound,
		};
	});

	const draft: DraftResponseDto = {
		draft: {
			id: draftData.id,
			seasonId: draftData.seasonId,
			commissionerId: draftData.commissionerId,
			status: draftData.status,
			currentPickId: draftData.currentPickId,
			draftPicks: picksPerRound,
			draftOrder: draftData.draftOrder,
		},
		teamId: team.id,
	};

	return draft;
}
