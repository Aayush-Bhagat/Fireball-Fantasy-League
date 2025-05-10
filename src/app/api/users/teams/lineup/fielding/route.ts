import { EditLineupRequestDto, EditLineupRequestSchema } from "@/dtos/teamDtos";
import { verifyJwtToken } from "@/lib/authUtils";
import { editTeamLineup } from "@/services/teamService";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(request: NextRequest) {
	const token = request.headers.get("Authorization")?.split(" ")[1];

	if (!token) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	verifyJwtToken(token);

	const lineup: EditLineupRequestDto = await request.json();

	const parsedLineup = EditLineupRequestSchema.safeParse(lineup);

	if (!parsedLineup.success) {
		return NextResponse.json({ error: "Invalid lineup" }, { status: 400 });
	}

	await editTeamLineup(parsedLineup.data);

	return NextResponse.json({ message: "Lineup updated" });
}
