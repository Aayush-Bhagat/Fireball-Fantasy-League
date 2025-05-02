import {
	pgTable,
	uuid,
	text,
	integer,
	boolean,
	primaryKey,
	index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { teams, teamLineups } from "./teams";
import { games } from "./games";
import { tradeAssets } from "./trades";

export const players = pgTable(
	"players",
	{
		id: uuid("id").primaryKey(),
		name: text("name").notNull().unique(),
		teamId: uuid("team_id")
			.notNull()
			.references(() => teams.id),
		pic: text("pic"),
		isCaptain: boolean("is_captain").notNull(),
		pitchingScore: integer("pitching_score").notNull(),
		runningScore: integer("running_score").notNull(),
		battingScore: integer("batting_score").notNull(),
		fieldingScore: integer("fielding_score").notNull(),
		starPitch: text("star_pitch"),
		starSwing: text("star_swing"),
		fieldingPower: text("fielding_power"),
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
		inningsPitched: integer("innings_pitched").notNull(),
		runsAllowed: integer("runs_allowed").notNull(),
		putouts: integer("outs").notNull(),
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
