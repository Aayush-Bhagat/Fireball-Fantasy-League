CREATE TYPE "public"."draft_status_enum" AS ENUM('not_started', 'in_progress', 'completed');--> statement-breakpoint
CREATE TABLE "draft" (
	"id" uuid PRIMARY KEY NOT NULL,
	"season_id" integer,
	"status" "draft_status_enum" DEFAULT 'not_started' NOT NULL,
	"current_pick_id" uuid,
	"commissioner_id" uuid
);
--> statement-breakpoint
CREATE TABLE "draft_order" (
	"draft_id" uuid NOT NULL,
	"team_id" uuid NOT NULL,
	"pick_number" integer NOT NULL,
	CONSTRAINT "draft_order_draft_id_team_id_pk" PRIMARY KEY("draft_id","team_id")
);
--> statement-breakpoint
DROP INDEX "idx_draft_picks_season";--> statement-breakpoint
ALTER TABLE "draft_picks" ADD COLUMN "draft_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "draft_picks" ADD COLUMN "overall_pick" integer;--> statement-breakpoint
ALTER TABLE "draft" ADD CONSTRAINT "draft_commissioner_id_users_id_fk" FOREIGN KEY ("commissioner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "draft_order" ADD CONSTRAINT "draft_order_draft_id_draft_id_fk" FOREIGN KEY ("draft_id") REFERENCES "public"."draft"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "draft_order" ADD CONSTRAINT "draft_order_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_draft_order_draft" ON "draft_order" USING btree ("draft_id");--> statement-breakpoint
CREATE INDEX "idx_draft_order_team" ON "draft_order" USING btree ("team_id");--> statement-breakpoint
ALTER TABLE "draft_picks" ADD CONSTRAINT "draft_picks_draft_id_draft_id_fk" FOREIGN KEY ("draft_id") REFERENCES "public"."draft"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_draft_picks_draft" ON "draft_picks" USING btree ("draft_id");