import { getSeasonSchedule } from "@/services/gameService";
import { NextResponse, NextRequest } from "next/server";

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ season: string }> }
) {
	const { season } = await params;

	const schedule = await getSeasonSchedule(season);

	return NextResponse.json(schedule, { status: 200 });
}
