import { db } from "@/db";

export function findAll() {
	const teams = db.query.teams.findMany({
		with: {
			owner: true,
			conference: true,
		},
	});

	return teams;
}

export async function findById(id: string) {
	const team = await db.query.teams.findFirst({
		where: (teams, { eq }) => eq(teams.id, id),
		with: {
			owner: true,
			conference: true,
		},
	});

	return team;
}
