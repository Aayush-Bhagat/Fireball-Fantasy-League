import { PlayerStatsResponseDto } from "@/dtos/playerDtos";
import { getAllFreeAgents } from "@/services/playerService";
import { NextResponse } from "next/server";

export async function GET() {
	const players = await getAllFreeAgents();

	const response: PlayerStatsResponseDto = {
		players: players,
	};

	return NextResponse.json(response, { status: 200 });
}
