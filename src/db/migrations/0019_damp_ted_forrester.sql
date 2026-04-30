ALTER TABLE "draft" ALTER COLUMN "season_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "seasons" ALTER COLUMN "start_date" DROP NOT NULL;