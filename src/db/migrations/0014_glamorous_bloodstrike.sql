ALTER TYPE "public"."trade_asset_type" ADD VALUE 'DraftPick';--> statement-breakpoint
ALTER TABLE "draft_picks" ALTER COLUMN "pick" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "trade_assets" ADD COLUMN "draft_pick_id" uuid;--> statement-breakpoint
ALTER TABLE "trade_assets" ADD CONSTRAINT "trade_assets_draft_pick_id_draft_picks_id_fk" FOREIGN KEY ("draft_pick_id") REFERENCES "public"."draft_picks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_draft_picks_team" ON "draft_picks" USING btree ("team_id");--> statement-breakpoint
CREATE INDEX "idx_draft_picks_season" ON "draft_picks" USING btree ("season_id");