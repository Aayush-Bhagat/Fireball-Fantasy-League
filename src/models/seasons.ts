import {
	pgTable,
	serial,
	uuid,
	integer,
	timestamp,
	pgEnum,
	text,
	primaryKey,
	index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { keepSlots, teams } from "./teams";
import { games, playoffSeries } from "./games";
import { trades } from "./trades";
import { playerHistory } from "./players";
import { recaps } from "./recaps";
import { rankings } from "./rankings";

export const seasons = pgTable(
	"seasons",
	{
		id: serial("id").primaryKey(),
		startDate: timestamp("start_date", { withTimezone: true })
			.defaultNow()
			.notNull(),
		endDate: timestamp("end_date", { withTimezone: true }),
		currentWeek: integer("current_week").default(1).notNull(),
	},
	(table) => [index("idx_season_current_week").on(table.currentWeek)]
);

export type Season = typeof seasons.$inferSelect;
export type CreateSeason = typeof seasons.$inferInsert;

export const seasonRelations = relations(seasons, ({ many }) => ({
	games: many(games),
	playoffSeries: many(playoffSeries),
	awards: many(seasonAwards),
	trades: many(trades),
	keeps: many(keepSlots),
	playerHistory: many(playerHistory),
	recaps: many(recaps),
	rankings: many(rankings),
}));

export const awardCategories = pgEnum("award_categories", [
	"Team",
	"Player",
	"Playoffs",
]);

export const awards = pgTable("awards", {
	id: uuid("id").primaryKey(),
	name: text("name").notNull().unique(),
	description: text("description").notNull(),
	category: awardCategories("category").notNull(),
});

export type Award = typeof awards.$inferSelect;
export type CreateAward = typeof awards.$inferInsert;

export const awardsRelations = relations(awards, ({ many }) => ({
	seasonAwards: many(seasonAwards),
}));

export const seasonAwards = pgTable(
	"season_awards",
	{
		seasonId: integer("season_id")
			.notNull()
			.references(() => seasons.id),
		awardId: uuid("award_id")
			.notNull()
			.references(() => awards.id),
		playerId: uuid("player_id"),
		teamId: uuid("team_id").references(() => teams.id),
		awardedAt: timestamp("awarded_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
	},
	(table) => [
		primaryKey({ columns: [table.seasonId, table.awardId] }),
		index("idx_season_awards_player").on(table.playerId),
		index("idx_season_awards_team").on(table.teamId),
		index("idx_season_awards_season").on(table.seasonId),
	]
);

export type SeasonAward = typeof seasonAwards.$inferSelect;
export type CreateSeasonAward = typeof seasonAwards.$inferInsert;

export const seasonAwardsRelations = relations(seasonAwards, ({ one }) => ({
	season: one(seasons, {
		fields: [seasonAwards.seasonId],
		references: [seasons.id],
	}),
	award: one(awards, {
		fields: [seasonAwards.awardId],
		references: [awards.id],
	}),
	team: one(teams, {
		fields: [seasonAwards.teamId],
		references: [teams.id],
	}),
}));
