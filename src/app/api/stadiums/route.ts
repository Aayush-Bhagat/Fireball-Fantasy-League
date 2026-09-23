import { StadiumResponseDto } from "@/dtos/gameDtos";
import { getStadiums } from "@/services/gameService";
import { NextResponse } from "next/server";

export async function GET() {
	const stadiums = await getStadiums();

	const res: StadiumResponseDto = {
		stadiums: stadiums,
	};

	return NextResponse.json(res, {
		status: 200,
	});
}
