import { PlayerGameResponseDto } from "@/dtos/playerDtos";
import { getPlayerGames } from "@/services/playerService";
import { NextResponse } from "next/server";

export async function GET(
	request: Request,
	{ params }: { params: Promise<{ playerId: string }> }
) {
	const { playerId } = await params;
	const playerGames = await getPlayerGames(playerId);

	const response: PlayerGameResponseDto = {
		games: playerGames,
	};
	return NextResponse.json(response, { status: 200 });
}
