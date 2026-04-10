CREATE TABLE "draft_picks" (
	"id" uuid PRIMARY KEY NOT NULL,
	"team_id" uuid NOT NULL,
	"season_id" integer NOT NULL,
	"round" integer NOT NULL,
	"pick" integer NOT NULL,
	"original_team_id" uuid NOT NULL,
	"selection" uuid,
	"is_compensatory" boolean DEFAULT false NOT NULL,
	"tradeable" boolean NOT NULL
);
--> statement-breakpoint
ALTER TABLE "draft_picks" ADD CONSTRAINT "draft_picks_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "draft_picks" ADD CONSTRAINT "draft_picks_season_id_seasons_id_fk" FOREIGN KEY ("season_id") REFERENCES "public"."seasons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "draft_picks" ADD CONSTRAINT "draft_picks_original_team_id_teams_id_fk" FOREIGN KEY ("original_team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "draft_picks" ADD CONSTRAINT "draft_picks_selection_players_id_fk" FOREIGN KEY ("selection") REFERENCES "public"."players"("id") ON DELETE no action ON UPDATE no action;