ALTER TABLE "season_awards" DROP CONSTRAINT "season_awards_season_id_award_id_pk";--> statement-breakpoint
ALTER TABLE "season_awards" ADD COLUMN "id" uuid PRIMARY KEY NOT NULL;--> statement-breakpoint
ALTER TABLE "season_awards" ADD CONSTRAINT "season_awards_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE no action ON UPDATE no action;