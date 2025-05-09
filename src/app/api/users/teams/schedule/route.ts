import { GameResponseDto } from "@/dtos/gameDtos";
import { verifyJwtToken } from "@/lib/authUtils";
import { getUserTeamSchedule } from "@/services/teamService";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
	const token = request.headers.get("Authorization")?.split(" ")[1];

	if (!token) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const userId = verifyJwtToken(token);

	const schedule = await getUserTeamSchedule(userId);

	const response: GameResponseDto = {
		games: schedule,
	};

	return NextResponse.json(response, { status: 200 });
}
