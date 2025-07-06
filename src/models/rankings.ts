import { pgTable, uuid, text, integer } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { seasons } from "./seasons";

export const rankings = pgTable("rankings", {
	id: uuid("id").primaryKey(),
	week: integer("week").notNull(),
	season: integer("season")
		.notNull()
		.references(() => seasons.id),
	url: text("url").notNull(),
});

export type Ranking = typeof rankings.$inferSelect;
export type CreateRanking = typeof rankings.$inferInsert;

export const rankingRelations = relations(rankings, ({ one }) => ({
	season: one(seasons, {
		fields: [rankings.season],
		references: [seasons.id],
	}),
}));
