import {
	pgTable,
	uuid,
	text,
	integer,
	timestamp,
	pgEnum,
	unique,
	index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { teams } from "./teams";
import { players } from "./players";
import { keepSlots } from "./teams";
import { seasons } from "./seasons";

export const tradeStatus = pgEnum("trade_status", [
	"Pending",
	"Accepted",
	"Declined",
	"Countered",
	"Canceled",
]);

export const trades = pgTable(
	"trades",
	{
		id: uuid("id").primaryKey(),
		proposingTeamId: uuid("proposing_team_id")
			.notNull()
			.references(() => teams.id),
		receivingTeamId: uuid("receiving_team_id")
			.notNull()
			.references(() => teams.id),
		seasonId: integer("season_id")
			.notNull()
			.references(() => seasons.id),
		message: text("message"),
		parentId: uuid("parent_id"),
		status: tradeStatus("status").default("Pending").notNull(),
		proposedAt: timestamp("proposed_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
		resolvedAt: timestamp("resolved_at", { withTimezone: true }),
	},
	(table) => [
		index("idx_trade_proposing_team").on(table.proposingTeamId),
		index("idx_trade_receiving_team").on(table.receivingTeamId),
		index("idx_trade_parent").on(table.parentId),
	]
);

export type Trade = typeof trades.$inferSelect;
export type CreateTrade = typeof trades.$inferInsert;

export const tradeRelations = relations(trades, ({ one, many }) => ({
	proposingTeam: one(teams, {
		fields: [trades.proposingTeamId],
		references: [teams.id],
	}),
	receivingTeam: one(teams, {
		fields: [trades.receivingTeamId],
		references: [teams.id],
	}),
	seasons: one(seasons, {
		fields: [trades.seasonId],
		references: [seasons.id],
	}),
	parentTrade: one(trades, {
		fields: [trades.parentId],
		references: [trades.id],
	}),
	tradeAssets: many(tradeAssets),
}));

export const tradeAssetType = pgEnum("trade_asset_type", ["Player", "Keep"]);

export const tradeAssets = pgTable(
	"trade_assets",
	{
		id: uuid("id").primaryKey(),
		tradeId: uuid("trade_id")
			.notNull()
			.references(() => trades.id),
		playerId: uuid("player_id").references(() => players.id),
		keepId: uuid("keep_id").references(() => keepSlots.id),
		fromTeamId: uuid("from_team_id")
			.notNull()
			.references(() => teams.id),
		toTeamId: uuid("to_team_id")
			.notNull()
			.references(() => teams.id),
		assetType: tradeAssetType("asset_type").notNull(),
	},
	(table) => [
		unique().on(table.tradeId, table.playerId),
		unique().on(table.tradeId, table.keepId),
		index("idx_trade_asset_trade").on(table.tradeId),
		index("idx_trade_asset_player").on(table.playerId),
		index("idx_trade_asset_keep").on(table.keepId),
		index("idx_trade_asset_from_team").on(table.fromTeamId),
		index("idx_trade_asset_to_team").on(table.toTeamId),
	]
);

export type TradeAsset = typeof tradeAssets.$inferSelect;
export type CreateTradeAsset = typeof tradeAssets.$inferInsert;

export const tradeAssetsRelations = relations(tradeAssets, ({ one }) => ({
	trade: one(trades, {
		fields: [tradeAssets.tradeId],
		references: [trades.id],
	}),
	player: one(players, {
		fields: [tradeAssets.playerId],
		references: [players.id],
	}),
	keep: one(keepSlots, {
		fields: [tradeAssets.keepId],
		references: [keepSlots.id],
	}),
	fromTeam: one(teams, {
		fields: [tradeAssets.fromTeamId],
		references: [teams.id],
	}),
	toTeam: one(teams, {
		fields: [tradeAssets.toTeamId],
		references: [teams.id],
	}),
}));
