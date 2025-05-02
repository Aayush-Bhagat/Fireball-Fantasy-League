import { pgTable, uuid, pgEnum, text } from "drizzle-orm/pg-core";

export const userRole = pgEnum("user_role", ["admin", "team"]);

export const users = pgTable("users", {
	id: uuid("id").primaryKey(),
	name: text("name").notNull(),
	role: userRole("role").default("team").notNull(),
});

export type User = typeof users.$inferSelect;
export type CreateUser = typeof users.$inferInsert;
