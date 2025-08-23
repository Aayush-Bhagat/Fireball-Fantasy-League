import { PlayerAwardsResponse } from "./../../../../../dtos/awardDtos";
import { getPlayerAwards } from "@/services/playerService";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ playerId: string }> }
) {
	const { playerId } = await params;

	const playerAwards = await getPlayerAwards(playerId);

	const res: PlayerAwardsResponse = {
		awards: playerAwards,
	};

	return NextResponse.json(playerAwards);
}
