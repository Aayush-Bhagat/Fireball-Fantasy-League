import { relations } from "drizzle-orm";
import {
	boolean,
	index,
	integer,
	pgEnum,
	pgTable,
	primaryKey,
	uuid,
} from "drizzle-orm/pg-core";
import { teams } from "./teams";
import { seasons } from "./seasons";
import { players } from "./players";
import { users } from "./users";

export const draftStatusEnum = pgEnum("draft_status_enum", [
	"not_started",
	"in_progress",
	"completed",
]);

export const draft = pgTable("draft", {
	id: uuid("id").primaryKey(),
	seasonId: integer("season_id"),
	status: draftStatusEnum("status").notNull().default("not_started"),
	currentPickId: uuid("current_pick_id"),
	commissionerId: uuid("commissioner_id").references(() => users.id),
});

export type Draft = typeof draft.$inferSelect;
export type CreateDraft = typeof draft.$inferInsert;

export const draftRelations = relations(draft, ({ one }) => ({
	season: one(seasons, {
		fields: [draft.seasonId],
		references: [seasons.id],
	}),
	currentPick: one(draftPicks, {
		fields: [draft.currentPickId],
		references: [draftPicks.id],
	}),
	commissioner: one(users, {
		fields: [draft.commissionerId],
		references: [users.id],
	}),
}));

export const draftOrder = pgTable(
	"draft_order",
	{
		draftId: uuid("draft_id")
			.notNull()
			.references(() => draft.id),
		teamId: uuid("team_id")
			.notNull()
			.references(() => teams.id),
		pickNumber: integer("pick_number").notNull(),
	},
	(table) => [
		primaryKey({ columns: [table.draftId, table.teamId] }),
		index("idx_draft_order_draft").on(table.draftId),
		index("idx_draft_order_team").on(table.teamId),
	],
);

export const draftPicks = pgTable(
	"draft_picks",
	{
		id: uuid("id").primaryKey(),
		teamId: uuid("team_id")
			.notNull()
			.references(() => teams.id),
		seasonId: integer("season_id")
			.notNull()
			.references(() => seasons.id),
		draftId: uuid("draft_id")
			.notNull()
			.references(() => draft.id),
		round: integer("round").notNull(),
		pick: integer("pick"),
		overallPick: integer("overall_pick"),
		originalTeamId: uuid("original_team_id")
			.notNull()
			.references(() => teams.id),
		selection: uuid("selection").references(() => players.id),
		isCompensatory: boolean("is_compensatory").notNull().default(false),
		tradeable: boolean("tradeable").notNull(),
	},
	(table) => [
		index("idx_draft_picks_team").on(table.teamId),
		index("idx_draft_picks_draft").on(table.draftId),
	],
);

export type DraftPick = typeof draftPicks.$inferSelect;
export type CreateDraftPick = typeof draftPicks.$inferInsert;

export const draftPicksRelations = relations(draftPicks, ({ one }) => ({
	team: one(teams, {
		fields: [draftPicks.teamId],
		references: [teams.id],
		relationName: "draft_picks",
	}),
	season: one(seasons, {
		fields: [draftPicks.seasonId],
		references: [seasons.id],
	}),
	draft: one(draft, {
		fields: [draftPicks.draftId],
		references: [draft.id],
	}),
	originalTeam: one(teams, {
		fields: [draftPicks.originalTeamId],
		references: [teams.id],
	}),
	selection: one(players, {
		fields: [draftPicks.selection],
		references: [players.id],
	}),
}));
