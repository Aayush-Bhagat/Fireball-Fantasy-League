import { db } from "@/db";
import { draft } from "@/models/draft";
import { and, eq } from "drizzle-orm";

export async function findDraft(draftId: string) {
	const draftData = await db.query.draft.findFirst({
		where: (draft, { eq }) => eq(draft.id, draftId),
		with: {
			draftPicks: {
				with: {
					playerSelected: true,
					originalTeam: true,
					team: true,
				},
				orderBy: (draftPicks, { asc }) => asc(draftPicks.overallPick),
			},
			draftOrder: {
				with: {
					team: true,
				},
				orderBy: (draftOrder, { asc }) => [asc(draftOrder.pickNumber)],
			},
		},
	});
	return draftData;
}

export async function updateDraftToInProgress(draftId: string, userId: string) {
	await db
		.update(draft)
		.set({
			status: "in_progress",
		})
		.where(and(eq(draft.id, draftId), eq(draft.commissionerId, userId)));
}
