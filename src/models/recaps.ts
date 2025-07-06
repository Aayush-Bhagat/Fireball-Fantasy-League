import { pgTable, uuid, text, integer } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { seasons } from "./seasons";

export const recaps = pgTable("recaps", {
	id: uuid("id").primaryKey(),
	week: integer("week").notNull(),
	season: integer("season")
		.notNull()
		.references(() => seasons.id),
	recap: text("recap").notNull(),
});

export type Recap = typeof recaps.$inferSelect;
export type CreateRecap = typeof recaps.$inferInsert;

export const recapRelations = relations(recaps, ({ one }) => ({
	season: one(seasons, {
		fields: [recaps.season],
		references: [seasons.id],
	}),
}));
