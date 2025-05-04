import { StandingsDto } from "@/dtos/teamDtos";
import { getStandings } from "@/services/teamService";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ season: string }> }
) {
	const { season } = await params;

	if (!season) {
		return NextResponse.json(
			{ error: "Season is required" },
			{ status: 400 }
		);
	}

	const standings = await getStandings(season);

	const response: StandingsDto = {
		eastern: standings.eastern,
		western: standings.western,
	};

	return NextResponse.json(response, { status: 200 });
}
