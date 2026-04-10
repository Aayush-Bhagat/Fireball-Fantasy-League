import { db } from "@/db";

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
