import { getGameStats } from "@/services/gameService";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
	req: NextRequest,
	{ params }: { params: Promise<{ gameId: string }> }
) {
	const { gameId } = await params;

	const gameStats = await getGameStats(gameId);

	return NextResponse.json(gameStats);
}
