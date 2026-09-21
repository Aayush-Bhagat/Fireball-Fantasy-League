import { verifyJwtToken } from "@/lib/authUtils";
import { ROSTER_PROJECTION_CACHE_TAG } from "@/lib/cacheTags";
import { completeDraft } from "@/services/draftService";
import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

export async function POST(
	request: Request,
	{ params }: { params: Promise<{ draftId: string }> },
) {
	const token = request.headers.get("Authorization")?.split(" ")[1];

	if (!token) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const userId = verifyJwtToken(token);

	const { draftId } = await params;

	await completeDraft(draftId, userId);

	// Completed drafts assign players, changing every team's roster.
	revalidateTag(ROSTER_PROJECTION_CACHE_TAG);

	return NextResponse.json({ message: "Created Successfully" });
}
