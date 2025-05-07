ALTER TABLE "team_lineups" ALTER COLUMN "fielding_position" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "team_lineups" ALTER COLUMN "batting_order" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "players" ADD COLUMN "player_card_image" text;