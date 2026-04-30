CREATE TYPE "public"."season_status" AS ENUM('not_started', 'in_progress', 'offseason', 'completed');--> statement-breakpoint
ALTER TABLE "seasons" ADD COLUMN "status" "season_status" DEFAULT 'not_started' NOT NULL;--> statement-breakpoint
CREATE INDEX "idx_season_status" ON "seasons" USING btree ("status");