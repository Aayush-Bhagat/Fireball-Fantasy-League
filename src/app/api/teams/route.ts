import { teamResponseDto } from "./../../../dtos/teamDtos";
import { getAllTeams } from "@/services/teamService";
import { NextResponse } from "next/server";

export async function GET() {
	const teams = await getAllTeams();

	const response: teamResponseDto = {
		teams: teams,
	};

	return NextResponse.json(response, {
		status: 200,
	});
}
