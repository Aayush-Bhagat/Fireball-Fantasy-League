CREATE TYPE "public"."player_history_type" AS ENUM('Draft', 'Trade');--> statement-breakpoint
CREATE TABLE "player_history" (
	"id" uuid PRIMARY KEY NOT NULL,
	"player_id" uuid NOT NULL,
	"team_id" uuid NOT NULL,
	"season_id" integer NOT NULL,
	"trade_id" uuid,
	"draft_round" integer,
	"draft_pick" integer,
	"type" "player_history_type" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "player_history" ADD CONSTRAINT "player_history_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_history" ADD CONSTRAINT "player_history_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_history" ADD CONSTRAINT "player_history_season_id_seasons_id_fk" FOREIGN KEY ("season_id") REFERENCES "public"."seasons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_history" ADD CONSTRAINT "player_history_trade_id_trades_id_fk" FOREIGN KEY ("trade_id") REFERENCES "public"."trades"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_player_history_player" ON "player_history" USING btree ("player_id");--> statement-breakpoint
CREATE INDEX "idx_player_history_team" ON "player_history" USING btree ("team_id");--> statement-breakpoint
CREATE INDEX "idx_player_history_season" ON "player_history" USING btree ("season_id");--> statement-breakpoint
CREATE INDEX "idx_player_history_trade" ON "player_history" USING btree ("trade_id");