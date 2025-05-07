import { UpdateGameRequestDto, UpdateGameRequestSchema } from "@/dtos/gameDtos";
import { getUserRoleFromToken } from "@/lib/authUtils";
import { updateGame } from "@/services/gameService";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(request: NextRequest) {
	const token = request.headers.get("Authorization")?.split(" ")[1];

	if (!token) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const userRole = getUserRoleFromToken(token);

	if (userRole !== "admin") {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const body: UpdateGameRequestDto = await request.json();

	const result = UpdateGameRequestSchema.safeParse(body);

	if (!result.success) {
		return NextResponse.json(
			{ error: result.error.message },
			{ status: 400 }
		);
	}

	await updateGame(result.data);

	return NextResponse.json({ message: "Game updated" }, { status: 200 });
}
