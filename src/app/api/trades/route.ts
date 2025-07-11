import { createTrade } from "./../../../services/tradeService";
import { getCurrentSeasonTrades } from "@/services/tradeService";
import { NextResponse } from "next/server";
import {
	CreateTradeDto,
	TradeResponseDto,
	CreateTradeSchema,
} from "@/dtos/tradeDtos";
import { verifyJwtToken } from "@/lib/authUtils";

export async function GET() {
	const trades = await getCurrentSeasonTrades();

	const response: TradeResponseDto = {
		trades,
	};

	return NextResponse.json(response, { status: 200 });
}

export async function POST(request: Request) {
	const token = request.headers.get("Authorization")?.split(" ")[1];

	if (!token) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const userId = verifyJwtToken(token);

	const body: CreateTradeDto = await request.json();

	// Validate trade data
	const result = CreateTradeSchema.safeParse(body);

	if (!result.success) {
		return NextResponse.json(
			{ error: result.error.message },
			{ status: 400 }
		);
	}

	try {
		const tradeId = await createTrade(userId, result.data);
		return NextResponse.json({ tradeId }, { status: 201 });
	} catch (error) {
		return NextResponse.json(
			{ error: (error as Error).message },
			{ status: 500 }
		);
	}
}
