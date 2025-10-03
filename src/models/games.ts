import { playerGamesStats } from "./players";
import {
	pgTable,
	uuid,
	primaryKey,
	integer,
	timestamp,
	pgEnum,
	index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { seasons } from "./seasons";
import { teams } from "./teams";
import { conferences } from "./teams";

export const playoffRound = pgEnum("playoff_round", [
	"Play In",
	"Semifinals",
	"Finals",
]);

export const playoffSeries = pgTable("playoff_series", {
	id: uuid("id").primaryKey(),
	seasonId: integer("season_id")
		.notNull()
		.references(() => seasons.id),
	conferenceId: integer("conference_id")
		.notNull()
		.references(() => conferences.id),
	round: playoffRound("round").notNull(),
	winningTeamId: uuid("winning_team_id").references(() => teams.id),
});

export type PlayoffSeries = typeof playoffSeries.$inferSelect;
export type CreatePlayoffSeries = typeof playoffSeries.$inferInsert;

export const playoffSeriesRelations = relations(
	playoffSeries,
	({ one, many }) => ({
		season: one(seasons, {
			fields: [playoffSeries.seasonId],
			references: [seasons.id],
		}),
		conference: one(conferences, {
			fields: [playoffSeries.conferenceId],
			references: [conferences.id],
		}),
		winningTeam: one(teams, {
			fields: [playoffSeries.winningTeamId],
			references: [teams.id],
		}),
		games: many(games),
	})
);

export const games = pgTable(
	"games",
	{
		id: uuid("id").primaryKey(),
		seasonId: integer("season_id")
			.notNull()
			.references(() => seasons.id),
		playoffSeriesId: uuid("playoff_series_id").references(
			() => playoffSeries.id
		),
		week: integer("week").notNull(),
		playedAt: timestamp("played_at", { withTimezone: true }),
	},
	(table) => [
		index("idx_game_season_week").on(table.seasonId, table.week),
		index("idx_game_playoff_series").on(table.playoffSeriesId),
		index("idx_game_season").on(table.seasonId),
	]
);

export type Game = typeof games.$inferSelect;
export type CreateGame = typeof games.$inferInsert;

export const gameRelations = relations(games, ({ one, many }) => ({
	season: one(seasons, {
		fields: [games.seasonId],
		references: [seasons.id],
	}),
	playoffSeries: one(playoffSeries, {
		fields: [games.playoffSeriesId],
		references: [playoffSeries.id],
	}),
	teams: many(teamGames),
	playerGamesStats: many(playerGamesStats),
}));

export const gameOutcome = pgEnum("game_outcome", ["Win", "Loss", "Tie"]);

export const teamGames = pgTable(
	"team_games",
	{
		gameId: uuid("game_id")
			.notNull()
			.references(() => games.id),
		teamId: uuid("team_id")
			.notNull()
			.references(() => teams.id),
		score: integer("score"),
		outcome: gameOutcome("outcome"),
	},
	(table) => [
		primaryKey({ columns: [table.gameId, table.teamId] }),
		index("idx_team_games_game").on(table.gameId),
		index("idx_team_games_team").on(table.teamId),
	]
);

export type TeamGame = typeof teamGames.$inferSelect;
export type CreateTeamGame = typeof teamGames.$inferInsert;
