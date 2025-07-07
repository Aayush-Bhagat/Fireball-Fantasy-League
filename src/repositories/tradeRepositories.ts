import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { seasons } from "@/models/seasons";
import { sql } from "drizzle-orm";
import { trades } from "@/models/trades";

export async function findCompletedTrades() {
	const seasonQuery = db
		.select({
			id: sql<number>`max(${seasons.id})`.as("id"),
		})
		.from(seasons);

	const completedTrades = await db.query.trades.findMany({
		where: and(
			eq(trades.seasonId, seasonQuery),
			eq(trades.status, "Accepted")
		),
		with: {
			proposingTeam: true,
			receivingTeam: true,
			tradeAssets: {
				with: {
					player: true,
					fromTeam: true,
					toTeam: true,
					keep: true,
				},
			},
		},
		orderBy: (trades, { desc }) => [desc(trades.resolvedAt)],
	});

	return completedTrades;
}

export async function findTradeByTeamId(teamId: string) {
	const teamTrades = await db.query.trades.findMany({
		where: and(
			eq(trades.proposingTeamId, teamId),
			eq(trades.receivingTeamId, teamId)
		),
		with: {
			proposingTeam: true,
			receivingTeam: true,
			tradeAssets: {
				with: {
					player: true,
					fromTeam: true,
					toTeam: true,
					keep: true,
				},
			},
		},
		orderBy: (trades, { desc }) => [desc(trades.proposedAt)],
	});

	return teamTrades;
}
