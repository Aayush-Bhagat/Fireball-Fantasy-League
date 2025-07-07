import { NextRequest, NextResponse } from "next/server";
import { verifyJwtToken } from "@/lib/authUtils";
import { getTeamTrades } from "@/services/tradeService";
import { TradeResponseDto } from "@/dtos/tradeDtos";

export async function GET(request: NextRequest) {
	const token = request.headers.get("Authorization")?.split(" ")[1];

	if (!token) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const userId = verifyJwtToken(token);

	const teamTrades = await getTeamTrades(userId);

	const response: TradeResponseDto = {
		trades: teamTrades,
	};

	return NextResponse.json(response, { status: 200 });
}
