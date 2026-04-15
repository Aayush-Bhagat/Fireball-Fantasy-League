import { verifyJwtToken } from "@/lib/authUtils";
import { getDraft, startDraft } from "@/services/draftService";
import { NextResponse } from "next/server";

export async function PUT(
	request: Request,
	{ params }: { params: Promise<{ draftId: string }> },
) {
	const token = request.headers.get("Authorization")?.split(" ")[1];

	if (!token) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const userId = verifyJwtToken(token);

	const { draftId } = await params;

	console.log(draftId);

	await startDraft(draftId, userId);

	return NextResponse.json({ message: "Updated Successfully" });
}
