CREATE TYPE "public"."side" AS ENUM('Home', 'Away');--> statement-breakpoint
ALTER TABLE "team_games" ADD COLUMN "side" "side";