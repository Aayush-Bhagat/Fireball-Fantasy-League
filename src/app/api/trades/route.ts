import { getCurrentSeasonTrades } from "@/services/tradeService";
import { NextResponse } from "next/server";
import { TradeResponseDto } from "@/dtos/tradeDtos";

export async function GET() {
	const trades = await getCurrentSeasonTrades();

	const response: TradeResponseDto = {
		trades,
	};

	return NextResponse.json(response, { status: 200 });
}
