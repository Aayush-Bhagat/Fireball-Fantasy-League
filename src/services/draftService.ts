import { DraftResponseDto } from "@/dtos/draftDtos";
import { findDraft, updateDraftToInProgress } from "@/repositories/draft";
import { savePlayerHistory } from "@/repositories/playerRepository";
import { findTeamByUserId } from "@/repositories/teamRepository";
import { v7 as uuidV7 } from "uuid";

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

export async function startDraft(draftId: string, userId: string) {
	await updateDraftToInProgress(draftId, userId);
}

export async function completeDraft(draftId: string, userId: string) {
	const draft = await findDraft(draftId);

	if (!draft) {
		throw new Error("Failed to get Draft");
	}

	if (draft.commissionerId !== userId) {
		throw new Error("Unauthorized");
	}

	if (draft.status !== "completed") {
		throw new Error("Type Error");
	}

	draft.draftPicks.forEach(async (dp) => {
		const id = uuidV7();
		if (dp.selection) {
			await savePlayerHistory(
				id,
				dp.selection,
				dp.teamId,
				"Draft",
				null,
				dp.round,
				dp.pick,
				draft.seasonId,
				dp.id,
			);
		}
	});
}
