CREATE TYPE "public"."Stadium_Time" AS ENUM('Day', 'Night');--> statement-breakpoint
ALTER TABLE "games" ADD COLUMN "stadium_time" "Stadium_Time";