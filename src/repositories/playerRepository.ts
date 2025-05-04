import { db } from "@/db";
import { eq } from "drizzle-orm";
import { players, playerHistory } from "@/models/players";

export async function findPlayersByTeam(teamId: string) {
	const teamPlayers = await db.query.players.findMany({
		with: {
			team: { with: { conference: { columns: { name: true } } } },
		},
		where: eq(players.teamId, teamId),
	});

	return teamPlayers;
}

export async function findPlayerHistoryByPlayer(playerId: string) {
	const history = await db.query.playerHistory.findMany({
		where: eq(playerHistory.playerId, playerId),
		with: {
			team: { with: { conference: { columns: { name: true } } } },
		},
	});

	return history;
}
