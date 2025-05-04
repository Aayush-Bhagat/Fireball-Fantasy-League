import { getPlayerHistory } from "@/services/playerService";
import { PlayerHistoryResponseDto } from "@/dtos/playerDtos";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ playerId: string }> }
) {
	const { playerId } = await params;

	const history = await getPlayerHistory(playerId);

	const response: PlayerHistoryResponseDto = {
		history: history,
	};

	return NextResponse.json(response, { status: 200 });
}
