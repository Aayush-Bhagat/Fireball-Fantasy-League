CREATE TYPE "public"."season_phase" AS ENUM('offseason', 'regular_season', 'playoffs');--> statement-breakpoint
ALTER TABLE "seasons" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "seasons" ALTER COLUMN "status" SET DEFAULT 'not_started'::text;--> statement-breakpoint
DROP TYPE "public"."season_status";--> statement-breakpoint
CREATE TYPE "public"."season_status" AS ENUM('not_started', 'in_progress', 'completed');--> statement-breakpoint
ALTER TABLE "seasons" ALTER COLUMN "status" SET DEFAULT 'not_started'::"public"."season_status";--> statement-breakpoint
ALTER TABLE "seasons" ALTER COLUMN "status" SET DATA TYPE "public"."season_status" USING "status"::"public"."season_status";--> statement-breakpoint
ALTER TABLE "seasons" ADD COLUMN "phase" "season_phase" DEFAULT 'offseason' NOT NULL;