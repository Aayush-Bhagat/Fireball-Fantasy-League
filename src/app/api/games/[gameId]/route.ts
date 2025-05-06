import { AdminGameDto } from "@/dtos/gameDtos";
import { getGameById } from "@/services/gameService";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ gameId: string }> }
) {
	const { gameId } = await params;

	const game: AdminGameDto = await getGameById(gameId);

	return NextResponse.json(game);
}
