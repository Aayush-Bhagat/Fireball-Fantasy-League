ALTER TABLE "player_games_stats" ADD COLUMN "position" "fielding_positions";--> statement-breakpoint
ALTER TABLE "player_games_stats" ADD COLUMN "batting_order" integer;--> statement-breakpoint
ALTER TABLE "player_games_stats" DROP COLUMN "putout";--> statement-breakpoint
ALTER TABLE "player_games_stats" DROP COLUMN "fielding_errors";