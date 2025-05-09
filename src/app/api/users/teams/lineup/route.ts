import { getUserTeamLineup } from "@/services/teamService";
import { TeamLineupDto } from "@/dtos/teamDtos";
import { NextRequest, NextResponse } from "next/server";
import { verifyJwtToken } from "@/lib/authUtils";

export async function GET(request: NextRequest) {
	const token = request.headers.get("Authorization")?.split(" ")[1];

	if (!token) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const userId = verifyJwtToken(token);

	const lineup: TeamLineupDto = await getUserTeamLineup(userId);

	return NextResponse.json(lineup);
}
