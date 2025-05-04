import { getGamesByWeekAndSeason } from "@/services/gameService";
import { NextRequest, NextResponse } from "next/server";
import { GameResponseDto } from "@/dtos/gameDtos";

export async function GET(
	req: NextRequest,
	{ params }: { params: Promise<{ season: string }> }
) {
	try {
		const { season } = await params;

		const week = req.nextUrl.searchParams.get("week");

		const games = await getGamesByWeekAndSeason(
			week ? parseInt(week) : undefined,
			season
		);

		const response: GameResponseDto = {
			games: games,
		};

		return NextResponse.json(response, {
			status: 200,
			headers: { "Content-Type": "application/json" },
		});
	} catch (error) {
		console.error("Error fetching games:", error);
		return new Response("Internal server error", { status: 500 });
	}
}
