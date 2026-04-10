import { verifyJwtToken } from "@/lib/authUtils";
import { getDraft } from "@/services/draftService";
import { NextResponse } from "next/server";

export async function GET(
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

	const draft = await getDraft(userId, draftId);

	if (!draft) {
		return NextResponse.json({ error: "Draft not found" }, { status: 404 });
	}

	return NextResponse.json(draft);
}
