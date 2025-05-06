import { NextRequest, NextResponse } from "next/server";
import { getPlayerCareerStats } from "@/services/playerService";
import { PlayerCareerStatsDto } from "@/dtos/playerDtos";

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ playerId: string }> }
) {
	const { playerId } = await params;

	const playerCareerStats: PlayerCareerStatsDto = await getPlayerCareerStats(
		playerId
	);

	return NextResponse.json(playerCareerStats);
}
