import { playerGamesStats } from "./players";
import {
	pgTable,
	uuid,
	primaryKey,
	integer,
	timestamp,
	pgEnum,
	index,
	text,
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
	}),
);

export const StadiumTime = pgEnum("Stadium_Time", ["Day", "Night"]);

export const games = pgTable(
	"games",
	{
		id: uuid("id").primaryKey(),
		seasonId: integer("season_id")
			.notNull()
			.references(() => seasons.id),
		playoffSeriesId: uuid("playoff_series_id").references(
			() => playoffSeries.id,
		),
		week: integer("week").notNull(),
		playedAt: timestamp("played_at", { withTimezone: true }),
		stadiumId: uuid("stadium_id").references(() => stadiums.id),
		bannedStadiumId: uuid("banned_stadium_id").references(
			() => stadiums.id,
		),
		stadiumTime: StadiumTime("stadium_time"),
	},
	(table) => [
		index("idx_game_season_week").on(table.seasonId, table.week),
		index("idx_game_playoff_series").on(table.playoffSeriesId),
		index("idx_game_season").on(table.seasonId),
	],
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
	stadium: one(stadiums, {
		fields: [games.stadiumId],
		references: [stadiums.id],
	}),
	bannedStadium: one(stadiums, {
		fields: [games.bannedStadiumId],
		references: [stadiums.id],
	}),
	innings: many(gameInnings),
}));

export const gameOutcome = pgEnum("game_outcome", ["Win", "Loss", "Tie"]);
export const side = pgEnum("side", ["Home", "Away"]);

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
		side: side("side"),
	},
	(table) => [
		primaryKey({ columns: [table.gameId, table.teamId] }),
		index("idx_team_games_game").on(table.gameId),
		index("idx_team_games_team").on(table.teamId),
	],
);

export type TeamGame = typeof teamGames.$inferSelect;
export type CreateTeamGame = typeof teamGames.$inferInsert;

export const stadiums = pgTable("stadiums", {
	id: uuid("id").primaryKey(),
	name: text("name").notNull().unique(),
	icon: text("icon"),
	banner: text("banner"),
});

export const inningHalf = pgEnum("inning_half", ["Top", "Bottom"]);

export const gameInnings = pgTable(
	"game_innings",
	{
		gameId: uuid("game_id")
			.notNull()
			.references(() => games.id),

		teamId: uuid("team_id")
			.notNull()
			.references(() => teams.id),

		inning: integer("inning").notNull(),

		half: inningHalf("half").notNull(),

		runs: integer("runs"),
	},
	(table) => [
		primaryKey({
			columns: [table.gameId, table.inning, table.half],
		}),
	],
);

export const gameInningsRelations = relations(gameInnings, ({ one }) => ({
	game: one(games, {
		fields: [gameInnings.gameId],
		references: [games.id],
	}),

	team: one(teams, {
		fields: [gameInnings.teamId],
		references: [teams.id],
	}),
}));
