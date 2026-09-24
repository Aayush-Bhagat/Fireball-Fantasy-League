CREATE TYPE "public"."inning_half" AS ENUM('Top', 'Bottom');--> statement-breakpoint
CREATE TABLE "game_innings" (
	"game_id" uuid NOT NULL,
	"team_id" uuid NOT NULL,
	"inning" integer NOT NULL,
	"half" "inning_half" NOT NULL,
	"runs" integer,
	CONSTRAINT "game_innings_game_id_inning_half_pk" PRIMARY KEY("game_id","inning","half")
);
--> statement-breakpoint
ALTER TABLE "game_innings" ADD CONSTRAINT "game_innings_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game_innings" ADD CONSTRAINT "game_innings_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;