import { NextRequest, NextResponse } from "next/server";
import { getUserTeam } from "@/services/teamService";
import { verifyJwtToken } from "@/lib/authUtils";
import { TeamWithKeepsDto } from "@/dtos/teamDtos";

export async function GET(request: NextRequest) {
	const token = request.headers.get("Authorization")?.split(" ")[1];

	if (!token) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const userId = verifyJwtToken(token);

	const team: TeamWithKeepsDto = await getUserTeam(userId);

	return NextResponse.json(team);
}
