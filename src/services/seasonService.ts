import { SeasonDto } from "@/dtos/seasonDtos";
import { findAllSeasons } from "@/repositories/seasonRepository";

export async function getAllSeasons() {
	const seasons: SeasonDto[] = await findAllSeasons();

	return seasons;
}
