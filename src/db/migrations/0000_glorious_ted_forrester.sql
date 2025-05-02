CREATE TYPE "public"."game_outcome" AS ENUM('Win', 'Loss');--> statement-breakpoint
CREATE TYPE "public"."playoff_round" AS ENUM('Play In', 'Semifinals', 'Finals');--> statement-breakpoint
CREATE TYPE "public"."award_categories" AS ENUM('Team', 'Player', 'Playoffs');--> statement-breakpoint
CREATE TYPE "public"."fielding_positions" AS ENUM('C', '1B', '2B', '3B', 'SS', 'LF', 'CF', 'RF', 'P');--> statement-breakpoint
CREATE TYPE "public"."trade_asset_type" AS ENUM('Player', 'Keep');--> statement-breakpoint
CREATE TYPE "public"."trade_status" AS ENUM('Pending', 'Accepted', 'Declined', 'Countered', 'Canceled');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('admin', 'team');--> statement-breakpoint
CREATE TABLE "games" (
	"id" uuid PRIMARY KEY NOT NULL,
	"season_id" integer NOT NULL,
	"playoff_series_id" uuid,
	"week" integer NOT NULL,
	"played_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "playoff_series" (
	"id" uuid PRIMARY KEY NOT NULL,
	"season_id" integer NOT NULL,
	"conference_id" integer NOT NULL,
	"round" "playoff_round" NOT NULL,
	"winning_team_id" uuid
);
--> statement-breakpoint
CREATE TABLE "team_games" (
	"game_id" uuid NOT NULL,
	"team_id" uuid NOT NULL,
	"score" integer,
	"outcome" "game_outcome",
	CONSTRAINT "team_games_game_id_team_id_pk" PRIMARY KEY("game_id","team_id")
);
--> statement-breakpoint
CREATE TABLE "player_games_stats" (
	"game_id" uuid NOT NULL,
	"player_id" uuid NOT NULL,
	"team_id" uuid NOT NULL,
	"at_bats" integer NOT NULL,
	"hits" integer NOT NULL,
	"runs" integer NOT NULL,
	"rbis" integer NOT NULL,
	"walks" integer NOT NULL,
	"strikeouts" integer NOT NULL,
	"home_runs" integer NOT NULL,
	"innings_pitched" integer NOT NULL,
	"runs_allowed" integer NOT NULL,
	"outs" integer NOT NULL,
	CONSTRAINT "player_games_stats_game_id_player_id_pk" PRIMARY KEY("game_id","player_id")
);
--> statement-breakpoint
CREATE TABLE "players" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"team_id" uuid NOT NULL,
	"pic" text,
	"is_captain" boolean NOT NULL,
	"pitching_score" integer NOT NULL,
	"running_score" integer NOT NULL,
	"batting_score" integer NOT NULL,
	"fielding_score" integer NOT NULL,
	"star_pitch" text,
	"star_swing" text,
	"fielding_power" text,
	CONSTRAINT "players_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "awards" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"category" "award_categories" NOT NULL,
	CONSTRAINT "awards_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "season_awards" (
	"season_id" integer NOT NULL,
	"award_id" uuid NOT NULL,
	"player_id" uuid,
	"team_id" uuid,
	"awarded_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "season_awards_season_id_award_id_pk" PRIMARY KEY("season_id","award_id")
);
--> statement-breakpoint
CREATE TABLE "seasons" (
	"id" serial PRIMARY KEY NOT NULL,
	"start_date" timestamp with time zone DEFAULT now() NOT NULL,
	"end_date" timestamp with time zone,
	"current_week" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "conferences" (
	"id" integer PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	CONSTRAINT "conferences_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "keep_slots" (
	"id" uuid PRIMARY KEY NOT NULL,
	"team_id" uuid NOT NULL,
	"season_id" integer NOT NULL,
	"value" text NOT NULL,
	"original_team_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "team_lineups" (
	"player_id" uuid PRIMARY KEY NOT NULL,
	"fielding_position" "fielding_positions" NOT NULL,
	"batting_order" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "teams" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"user_id" uuid NOT NULL,
	"logo" text,
	"conference_id" integer NOT NULL,
	"abbreviation" text NOT NULL,
	CONSTRAINT "teams_name_unique" UNIQUE("name"),
	CONSTRAINT "teams_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "trade_assets" (
	"id" uuid PRIMARY KEY NOT NULL,
	"trade_id" uuid NOT NULL,
	"player_id" uuid,
	"keep_id" uuid,
	"from_team_id" uuid NOT NULL,
	"to_team_id" uuid NOT NULL,
	"asset_type" "trade_asset_type" NOT NULL,
	CONSTRAINT "trade_assets_trade_id_player_id_unique" UNIQUE("trade_id","player_id"),
	CONSTRAINT "trade_assets_trade_id_keep_id_unique" UNIQUE("trade_id","keep_id")
);
--> statement-breakpoint
CREATE TABLE "trades" (
	"id" uuid PRIMARY KEY NOT NULL,
	"proposing_team_id" uuid NOT NULL,
	"receiving_team_id" uuid NOT NULL,
	"season_id" integer NOT NULL,
	"message" text,
	"parent_id" uuid,
	"status" "trade_status" DEFAULT 'Pending' NOT NULL,
	"proposed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"resolved_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"role" "user_role" DEFAULT 'team' NOT NULL
);
--> statement-breakpoint
ALTER TABLE "games" ADD CONSTRAINT "games_season_id_seasons_id_fk" FOREIGN KEY ("season_id") REFERENCES "public"."seasons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "games" ADD CONSTRAINT "games_playoff_series_id_playoff_series_id_fk" FOREIGN KEY ("playoff_series_id") REFERENCES "public"."playoff_series"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "playoff_series" ADD CONSTRAINT "playoff_series_season_id_seasons_id_fk" FOREIGN KEY ("season_id") REFERENCES "public"."seasons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "playoff_series" ADD CONSTRAINT "playoff_series_conference_id_conferences_id_fk" FOREIGN KEY ("conference_id") REFERENCES "public"."conferences"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "playoff_series" ADD CONSTRAINT "playoff_series_winning_team_id_teams_id_fk" FOREIGN KEY ("winning_team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_games" ADD CONSTRAINT "team_games_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_games" ADD CONSTRAINT "team_games_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_games_stats" ADD CONSTRAINT "player_games_stats_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_games_stats" ADD CONSTRAINT "player_games_stats_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_games_stats" ADD CONSTRAINT "player_games_stats_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "players" ADD CONSTRAINT "players_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "season_awards" ADD CONSTRAINT "season_awards_season_id_seasons_id_fk" FOREIGN KEY ("season_id") REFERENCES "public"."seasons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "season_awards" ADD CONSTRAINT "season_awards_award_id_awards_id_fk" FOREIGN KEY ("award_id") REFERENCES "public"."awards"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "season_awards" ADD CONSTRAINT "season_awards_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "keep_slots" ADD CONSTRAINT "keep_slots_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "keep_slots" ADD CONSTRAINT "keep_slots_season_id_seasons_id_fk" FOREIGN KEY ("season_id") REFERENCES "public"."seasons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_lineups" ADD CONSTRAINT "team_lineups_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teams" ADD CONSTRAINT "teams_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teams" ADD CONSTRAINT "teams_conference_id_conferences_id_fk" FOREIGN KEY ("conference_id") REFERENCES "public"."conferences"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trade_assets" ADD CONSTRAINT "trade_assets_trade_id_trades_id_fk" FOREIGN KEY ("trade_id") REFERENCES "public"."trades"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trade_assets" ADD CONSTRAINT "trade_assets_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trade_assets" ADD CONSTRAINT "trade_assets_keep_id_keep_slots_id_fk" FOREIGN KEY ("keep_id") REFERENCES "public"."keep_slots"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trade_assets" ADD CONSTRAINT "trade_assets_from_team_id_teams_id_fk" FOREIGN KEY ("from_team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trade_assets" ADD CONSTRAINT "trade_assets_to_team_id_teams_id_fk" FOREIGN KEY ("to_team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trades" ADD CONSTRAINT "trades_proposing_team_id_teams_id_fk" FOREIGN KEY ("proposing_team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trades" ADD CONSTRAINT "trades_receiving_team_id_teams_id_fk" FOREIGN KEY ("receiving_team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trades" ADD CONSTRAINT "trades_season_id_seasons_id_fk" FOREIGN KEY ("season_id") REFERENCES "public"."seasons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_game_season_week" ON "games" USING btree ("season_id","week");--> statement-breakpoint
CREATE INDEX "idx_game_playoff_series" ON "games" USING btree ("playoff_series_id");--> statement-breakpoint
CREATE INDEX "idx_game_season" ON "games" USING btree ("season_id");--> statement-breakpoint
CREATE INDEX "idx_team_games_game" ON "team_games" USING btree ("game_id");--> statement-breakpoint
CREATE INDEX "idx_team_games_team" ON "team_games" USING btree ("team_id");--> statement-breakpoint
CREATE INDEX "idx_player_games_stats_player" ON "player_games_stats" USING btree ("player_id");--> statement-breakpoint
CREATE INDEX "idx_player_games_stats_game" ON "player_games_stats" USING btree ("game_id");--> statement-breakpoint
CREATE INDEX "idx_player_games_stats_team" ON "player_games_stats" USING btree ("team_id");--> statement-breakpoint
CREATE INDEX "idx_player_team" ON "players" USING btree ("team_id");--> statement-breakpoint
CREATE INDEX "idx_season_awards_player" ON "season_awards" USING btree ("player_id");--> statement-breakpoint
CREATE INDEX "idx_season_awards_team" ON "season_awards" USING btree ("team_id");--> statement-breakpoint
CREATE INDEX "idx_season_awards_season" ON "season_awards" USING btree ("season_id");--> statement-breakpoint
CREATE INDEX "idx_season_current_week" ON "seasons" USING btree ("current_week");--> statement-breakpoint
CREATE INDEX "idx_keep_slots_team" ON "keep_slots" USING btree ("team_id");--> statement-breakpoint
CREATE INDEX "idx_keep_slots_original_team" ON "keep_slots" USING btree ("original_team_id");--> statement-breakpoint
CREATE INDEX "idx_trade_asset_trade" ON "trade_assets" USING btree ("trade_id");--> statement-breakpoint
CREATE INDEX "idx_trade_asset_player" ON "trade_assets" USING btree ("player_id");--> statement-breakpoint
CREATE INDEX "idx_trade_asset_keep" ON "trade_assets" USING btree ("keep_id");--> statement-breakpoint
CREATE INDEX "idx_trade_asset_from_team" ON "trade_assets" USING btree ("from_team_id");--> statement-breakpoint
CREATE INDEX "idx_trade_asset_to_team" ON "trade_assets" USING btree ("to_team_id");--> statement-breakpoint
CREATE INDEX "idx_trade_proposing_team" ON "trades" USING btree ("proposing_team_id");--> statement-breakpoint
CREATE INDEX "idx_trade_receiving_team" ON "trades" USING btree ("receiving_team_id");--> statement-breakpoint
CREATE INDEX "idx_trade_parent" ON "trades" USING btree ("parent_id");