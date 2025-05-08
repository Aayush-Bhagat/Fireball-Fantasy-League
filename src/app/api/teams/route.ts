import { TeamResponseDto } from "@/dtos/teamDtos";
import { getAllTeams } from "@/services/teamService";
import { NextResponse } from "next/server";

export async function GET() {
	const teams = await getAllTeams();

	const response: TeamResponseDto = {
		teams: teams,
	};

	return NextResponse.json(response, {
		status: 200,
	});
}
