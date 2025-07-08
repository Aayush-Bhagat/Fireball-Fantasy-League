import { CreateTradeAsset } from "./../models/trades";
import { and, eq, or } from "drizzle-orm";
import { db } from "@/db";
import { seasons } from "@/models/seasons";
import { sql } from "drizzle-orm";
import { trades, tradeAssets } from "@/models/trades";

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
		where: or(
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

export async function saveTrade(
	tradeId: string,
	proposingTeamId: string,
	receivingTeamId: string
) {
	const seasonQuery = await db
		.select({
			id: sql<number>`max(${seasons.id})`.as("id"),
		})
		.from(seasons);

	const season = seasonQuery[0]?.id;

	const newTrade = await db.insert(trades).values({
		id: tradeId,
		proposingTeamId: proposingTeamId,
		receivingTeamId: receivingTeamId,
		seasonId: season,
	});

	return newTrade;
}

export async function addTradeAssets(assets: CreateTradeAsset[]) {
	const newTradeAssets = await db.insert(tradeAssets).values(assets);

	return newTradeAssets;
}

export async function findTradeById(tradeId: string) {
	const trade = await db.query.trades.findFirst({
		where: eq(trades.id, tradeId),
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
	});

	return trade;
}
