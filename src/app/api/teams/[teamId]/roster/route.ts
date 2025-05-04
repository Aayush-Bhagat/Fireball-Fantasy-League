import { getTeamRoster } from "@/services/teamService";
import { NextRequest, NextResponse } from "next/server";
import { TeamRosterDto } from "@/dtos/teamDtos";

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ teamId: string }> }
) {
	const { teamId } = await params;
	const roster = await getTeamRoster(teamId);

	const response: TeamRosterDto = {
		roster: roster,
	};

	return NextResponse.json(response);
}
