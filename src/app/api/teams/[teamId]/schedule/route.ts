import { GameResponseDto } from "@/dtos/gameDtos";
import { getTeamSchedule } from "@/services/teamService";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ teamId: string }> }
) {
	const { teamId } = await params;

	const season = request.nextUrl.searchParams.get("season");

	const teamSchedule = await getTeamSchedule(teamId, season);

	const response: GameResponseDto = {
		games: teamSchedule,
	};
	return NextResponse.json(response, { status: 200 });
}
