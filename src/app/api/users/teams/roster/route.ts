import { NextRequest, NextResponse } from "next/server";
import { getUserTeamRoster } from "@/services/teamService";
import { verifyJwtToken } from "@/lib/authUtils";
import { PlayerWithStatsDto } from "@/dtos/playerDtos";
import { TeamRosterDto } from "@/dtos/teamDtos";

export async function GET(request: NextRequest) {
	const token = request.headers.get("Authorization")?.split(" ")[1];

	if (!token) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const userId = verifyJwtToken(token);

	const roster: PlayerWithStatsDto[] = await getUserTeamRoster(userId);

	const response: TeamRosterDto = {
		roster: roster,
	};

	return NextResponse.json(response, { status: 200 });
}
