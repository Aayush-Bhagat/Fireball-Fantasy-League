import { verifyJwtToken } from "@/lib/authUtils";
import { ROSTER_PROJECTION_CACHE_TAG } from "@/lib/cacheTags";
import { acceptTrade } from "@/services/tradeService";
import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
	req: NextRequest,
	{ params }: { params: Promise<{ tradeId: string }> }
) {
	const { tradeId } = await params;

	if (!tradeId) {
		return new Response("Trade ID is required", { status: 400 });
	}

	const token = req.headers.get("Authorization")?.split(" ")[1];

	if (!token) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const userId = verifyJwtToken(token);

	try {
		await acceptTrade(userId, tradeId);
		// An accepted trade moves players between rosters, changing projections.
		revalidateTag(ROSTER_PROJECTION_CACHE_TAG);
		return NextResponse.json(
			{ message: "Trade accepted successfully" },
			{ status: 200 }
		);
	} catch (error) {
		return NextResponse.json(
			{ error: (error as Error).message },
			{ status: 500 }
		);
	}
}
