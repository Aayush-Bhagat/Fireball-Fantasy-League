import { NextRequest } from "next/server";
import { editTeamBattingOrder } from "@/services/teamService";
import { EditBattingOrderRequestSchema } from "@/dtos/teamDtos";
import { NextResponse } from "next/server";
import { verifyJwtToken } from "@/lib/authUtils";

export async function PUT(request: NextRequest) {
	const token = request.headers.get("Authorization")?.split(" ")[1];

	if (!token) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	verifyJwtToken(token);

	const body = await request.json();
	const validatedBody = EditBattingOrderRequestSchema.safeParse(body);

	if (!validatedBody.success) {
		return NextResponse.json(
			{ error: "Invalid request body" },
			{ status: 400 }
		);
	}
	await editTeamBattingOrder(validatedBody.data);

	return NextResponse.json({ message: "Batting order updated" });
}
