import { SeasonDto, SeasonResponseDto } from "@/dtos/seasonDtos";
import { getAllSeasons } from "@/services/seasonService";
import { NextResponse } from "next/server";

export async function GET() {
	const seasons: SeasonDto[] = await getAllSeasons();

	const res: SeasonResponseDto = {
		seasons: seasons,
	};

	return NextResponse.json(res, { status: 200 });
}
