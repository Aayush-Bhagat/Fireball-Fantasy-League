import { PlayerStatsResponseDto } from "@/dtos/playerDtos";
import { getAllPlayerStats } from "@/services/playerService";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
	const players = await getAllPlayerStats();

	const response: PlayerStatsResponseDto = {
		players: players,
	};

	return NextResponse.json(response, { status: 200 });
}
