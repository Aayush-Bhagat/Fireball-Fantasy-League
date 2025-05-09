import { getUserTeamLineup } from "@/services/teamService";
import { TeamLineupDto } from "@/dtos/teamDtos";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
	const userId = request.nextUrl.searchParams.get("userId");

	if (!userId) {
		return NextResponse.json(
			{ error: "User ID is required" },
			{ status: 400 }
		);
	}

	const lineup: TeamLineupDto = await getUserTeamLineup(userId);

	return NextResponse.json(lineup);
}
