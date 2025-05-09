import { NextRequest, NextResponse } from "next/server";
import { getTeamLineup } from "@/services/teamService";
import { TeamLineupDto } from "@/dtos/teamDtos";
export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ teamId: string }> }
) {
	const { teamId } = await params;
	const teamLineup: TeamLineupDto = await getTeamLineup(teamId);
	return NextResponse.json(teamLineup);
}
