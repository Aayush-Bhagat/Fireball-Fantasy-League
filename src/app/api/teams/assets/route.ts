import { NextRequest, NextResponse } from "next/server";
import { getAllTeamAssets } from "@/services/teamService";
import { verifyJwtToken } from "@/lib/authUtils";
import { TeamTradeAssetsDto } from "@/dtos/tradeDtos";

export async function GET(request: NextRequest) {
	const token = request.headers.get("Authorization")?.split(" ")[1];

	if (!token) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const userId = verifyJwtToken(token);

	const allAssets: TeamTradeAssetsDto = await getAllTeamAssets(userId);

	return NextResponse.json(allAssets);
}
