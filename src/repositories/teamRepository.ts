import { db } from "@/db";

export function findAll() {
	return db.query.teams.findMany({
		with: {
			owner: true,
			conference: true,
		},
	});
}
