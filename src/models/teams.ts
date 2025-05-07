import { trades, tradeAssets } from "./trades";
import {
	pgTable,
	uuid,
	text,
	integer,
	index,
	pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./users";
import { seasonAwards, seasons } from "./seasons";
import { players, playerGamesStats, playerHistory } from "./players";
import { playoffSeries, teamGames } from "./games";

export const conferences = pgTable("conferences", {
	id: integer("id").primaryKey(),
	name: text("name").notNull().unique(),
});

export const conferenceRelations = relations(conferences, ({ many }) => ({
	teams: many(teams),
}));

export const teams = pgTable("teams", {
	id: uuid("id").primaryKey(),
	name: text("name").notNull().unique(),
	userId: uuid("user_id")
		.notNull()
		.unique()
		.references(() => users.id),
	logo: text("logo"),
	conferenceId: integer("conference_id")
		.notNull()
		.references(() => conferences.id),
	abbreviation: text("abbreviation").notNull(),
});

export type Team = typeof teams.$inferSelect;
export type CreateTeam = typeof teams.$inferInsert;

export const teamRelations = relations(teams, ({ one, many }) => ({
	owner: one(users, {
		fields: [teams.userId],
		references: [users.id],
	}),
	conference: one(conferences, {
		fields: [teams.conferenceId],
		references: [conferences.id],
	}),
	players: many(players),
	trades: many(trades),
	tradeAssets: many(tradeAssets),
	keeps: many(keepSlots, {
		relationName: "keeps",
	}),
	originalKeeps: many(keepSlots, {
		relationName: "original_keeps",
	}),
	playerGamesStats: many(playerGamesStats),
	games: many(teamGames),
	playoffSeries: many(playoffSeries),
	seasonAwards: many(seasonAwards),
	playerHistory: many(playerHistory),
}));

export const fieldingPositions = pgEnum("fielding_positions", [
	"C",
	"1B",
	"2B",
	"3B",
	"SS",
	"LF",
	"CF",
	"RF",
	"P",
]);

export const teamLineups = pgTable("team_lineups", {
	playerId: uuid("player_id")
		.primaryKey()
		.references(() => players.id),
	fieldingPosition: fieldingPositions("fielding_position"),
	battingOrder: integer("batting_order"),
});

export type TeamLineup = typeof teamLineups.$inferSelect;
export type CreateTeamLineup = typeof teamLineups.$inferInsert;

export const teamLineupsRelations = relations(teamLineups, ({ one }) => ({
	player: one(players, {
		fields: [teamLineups.playerId],
		references: [players.id],
	}),
}));

export const keepSlots = pgTable(
	"keep_slots",
	{
		id: uuid("id").primaryKey(),
		teamId: uuid("team_id")
			.notNull()
			.references(() => teams.id),
		seasonId: integer("season_id")
			.notNull()
			.references(() => seasons.id),
		odds: text("odds").notNull(),
		originalTeamId: uuid("original_team_id").notNull(),
		value: integer("value").notNull(),
	},
	(table) => [
		index("idx_keep_slots_team").on(table.teamId),
		index("idx_keep_slots_original_team").on(table.originalTeamId),
	]
);

export type KeepSlot = typeof keepSlots.$inferSelect;
export type CreateKeepSlot = typeof keepSlots.$inferInsert;

export const keepSlotsRelations = relations(keepSlots, ({ one, many }) => ({
	team: one(teams, {
		fields: [keepSlots.teamId],
		references: [teams.id],
		relationName: "keeps",
	}),
	season: one(seasons, {
		fields: [keepSlots.seasonId],
		references: [seasons.id],
	}),
	originalTeam: one(teams, {
		fields: [keepSlots.originalTeamId],
		references: [teams.id],
		relationName: "original_keeps",
	}),
	tradeAssets: many(tradeAssets),
}));
