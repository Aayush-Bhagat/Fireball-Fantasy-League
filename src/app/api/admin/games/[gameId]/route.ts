import { AdminGameDto } from "@/dtos/gameDtos";
import { getUserRoleFromToken } from "@/lib/authUtils";
import { getGameById } from "@/services/gameService";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ gameId: string }> }
) {
	const token = request.headers.get("Authorization")?.split(" ")[1];

	if (!token) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const userRole = getUserRoleFromToken(token);

	if (userRole !== "admin") {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const { gameId } = await params;

	const game: AdminGameDto = await getGameById(gameId);

	return NextResponse.json(game);
}
