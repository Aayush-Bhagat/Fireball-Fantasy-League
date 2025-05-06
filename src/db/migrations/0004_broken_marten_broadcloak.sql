ALTER TABLE "players" ALTER COLUMN "team_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "keep_slots" RENAME COLUMN "value" TO "odds";--> statement-breakpoint
ALTER TABLE "keep_slots" ADD COLUMN "value" integer NOT NULL;