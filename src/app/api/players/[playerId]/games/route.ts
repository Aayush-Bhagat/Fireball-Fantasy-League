import { PlayerGameResponseDto } from "@/dtos/playerDtos";
import { getPlayerGames } from "@/services/playerService";
import { NextResponse } from "next/server";

export async function GET(
	request: Request,
	{ params }: { params: Promise<{ playerId: string }> }
) {
	const { playerId } = await params;

	const { searchParams } = new URL(request.url);

	const season = searchParams.get("season") || undefined;

	const playerGames = await getPlayerGames(playerId, season);

	const response: PlayerGameResponseDto = {
		games: playerGames,
	};
	return NextResponse.json(response, { status: 200 });
}
