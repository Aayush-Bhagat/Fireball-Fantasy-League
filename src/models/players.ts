import {
	pgTable,
	uuid,
	text,
	integer,
	boolean,
	primaryKey,
	index,
	pgEnum,
	timestamp,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { teams, teamLineups } from "./teams";
import { games } from "./games";
import { tradeAssets, trades } from "./trades";
import { seasons } from "./seasons";

export const players = pgTable(
	"players",
	{
		id: uuid("id").primaryKey(),
		name: text("name").notNull().unique(),
		teamId: uuid("team_id").references(() => teams.id),
		image: text("image"),
		isCaptain: boolean("is_captain").notNull(),
		pitching: integer("pitching").notNull(),
		running: integer("running").notNull(),
		batting: integer("batting").notNull(),
		fielding: integer("fielding").notNull(),
		starPitch: text("star_pitch"),
		starSwing: text("star_swing"),
		fieldingAbility: text("fielding_ability"),
	},
	(table) => [index("idx_player_team").on(table.teamId)]
);

export type Player = typeof players.$inferSelect;
export type CreatePlayer = typeof players.$inferInsert;

export const playerRelations = relations(players, ({ one, many }) => ({
	team: one(teams, {
		fields: [players.teamId],
		references: [teams.id],
	}),
	playerGamesStats: many(playerGamesStats),
	tradeAssets: many(tradeAssets),
	teamLineups: one(teamLineups),
	playerHistory: many(playerHistory),
}));

export const playerGamesStats = pgTable(
	"player_games_stats",
	{
		gameId: uuid("game_id")
			.notNull()
			.references(() => games.id),
		playerId: uuid("player_id")
			.notNull()
			.references(() => players.id),
		teamId: uuid("team_id")
			.notNull()
			.references(() => teams.id),
		atBats: integer("at_bats").notNull(),
		hits: integer("hits").notNull(),
		runs: integer("runs").notNull(),
		rbis: integer("rbis").notNull(),
		walks: integer("walks").notNull(),
		strikeouts: integer("strikeouts").notNull(),
		homeRuns: integer("home_runs").notNull(),
		outsPitched: integer("outs_pitched").notNull(),
		runsAllowed: integer("runs_allowed").notNull(),
		outs: integer("outs").notNull(),
	},
	(table) => [
		primaryKey({ columns: [table.gameId, table.playerId] }),
		index("idx_player_games_stats_player").on(table.playerId),
		index("idx_player_games_stats_game").on(table.gameId),
		index("idx_player_games_stats_team").on(table.teamId),
	]
);

export type PlayerGamesStats = typeof playerGamesStats.$inferSelect;
export type CreatePlayerGamesStats = typeof playerGamesStats.$inferInsert;

export const playerGamesStatsRelations = relations(
	playerGamesStats,
	({ one }) => ({
		game: one(games, {
			fields: [playerGamesStats.gameId],
			references: [games.id],
		}),
		player: one(players, {
			fields: [playerGamesStats.playerId],
			references: [players.id],
		}),
		team: one(teams, {
			fields: [playerGamesStats.teamId],
			references: [teams.id],
		}),
	})
);

export const playerHistoryType = pgEnum("player_history_type", [
	"Draft",
	"Trade",
]);

export const playerHistory = pgTable(
	"player_history",
	{
		id: uuid("id").primaryKey(),
		playerId: uuid("player_id")
			.notNull()
			.references(() => players.id),
		teamId: uuid("team_id")
			.notNull()
			.references(() => teams.id),
		seasonId: integer("season_id")
			.notNull()
			.references(() => seasons.id),
		tradeId: uuid("trade_id").references(() => trades.id),
		draftRound: integer("draft_round"),
		draftPick: integer("draft_pick"),
		type: playerHistoryType("type").notNull(),
		createdAt: timestamp("created_at", { withTimezone: true })
			.notNull()
			.defaultNow(),
	},
	(table) => [
		index("idx_player_history_player").on(table.playerId),
		index("idx_player_history_team").on(table.teamId),
		index("idx_player_history_season").on(table.seasonId),
		index("idx_player_history_trade").on(table.tradeId),
	]
);

export type PlayerHistory = typeof playerHistory.$inferSelect;
export type CreatePlayerHistory = typeof playerHistory.$inferInsert;

export const playerHistoryRelations = relations(playerHistory, ({ one }) => ({
	player: one(players, {
		fields: [playerHistory.playerId],
		references: [players.id],
	}),
	team: one(teams, {
		fields: [playerHistory.teamId],
		references: [teams.id],
	}),
	season: one(seasons, {
		fields: [playerHistory.seasonId],
		references: [seasons.id],
	}),
	trade: one(trades, {
		fields: [playerHistory.tradeId],
		references: [trades.id],
	}),
}));
