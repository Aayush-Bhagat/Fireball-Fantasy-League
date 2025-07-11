import { verifyJwtToken } from "@/lib/authUtils";
import { cancelTrade } from "@/services/tradeService";
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
		await cancelTrade(userId, tradeId);
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
