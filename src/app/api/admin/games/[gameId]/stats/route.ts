import { UpdateGameRequestDto, UpdateGameRequestSchema } from "@/dtos/gameDtos";
import { getUserRoleFromToken } from "@/lib/authUtils";
import { setPlayerGameStats } from "@/services/statTrackerService";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
	const formData = await request.formData();

	const file = formData.get("file") as File | null;

	if (!file || !(file instanceof File)) {
		return NextResponse.json({ error: "Invalid file" }, { status: 400 });
	}
	// const token = request.headers.get("Authorization")?.split(" ")[1];

	// if (!token) {
	// 	return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	// }

	// const userRole = getUserRoleFromToken(token);

	// if (userRole !== "admin") {
	// 	return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	// }

	const buffer = await file.arrayBuffer();

	setPlayerGameStats();

	return NextResponse.json(
		{ message: "Game stats updated" },
		{ status: 200 },
	);
}
