import { PlayerStatsResponseDto } from "@/dtos/playerDtos";
import { getAllPlayerStats } from "@/services/playerService";
import { NextResponse, NextRequest } from "next/server";

export async function GET(request: NextRequest) {
	const { searchParams } = new URL(request.url);
	const season = searchParams.get("season") || undefined;

	const players = await getAllPlayerStats(season);

	const response: PlayerStatsResponseDto = {
		players: players,
	};

	return NextResponse.json(response, { status: 200 });
}
