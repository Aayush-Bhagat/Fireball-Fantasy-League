import { db } from "@/db";

export async function findAllSeasons() {
	const seasons = await db.query.seasons.findMany({
		orderBy: (seasons, { desc }) => [desc(seasons.id)],
	});

	return seasons;
}
