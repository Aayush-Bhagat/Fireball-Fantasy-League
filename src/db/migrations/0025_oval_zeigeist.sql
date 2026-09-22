CREATE TABLE "stadiums" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"icon" text,
	"banner" text,
	CONSTRAINT "stadiums_name_unique" UNIQUE("name")
);
--> statement-breakpoint
ALTER TABLE "games" ADD COLUMN "stadium_id" uuid;--> statement-breakpoint
ALTER TABLE "games" ADD COLUMN "banned_stadium_id" uuid;--> statement-breakpoint
ALTER TABLE "games" ADD CONSTRAINT "games_stadium_id_stadiums_id_fk" FOREIGN KEY ("stadium_id") REFERENCES "public"."stadiums"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "games" ADD CONSTRAINT "games_banned_stadium_id_stadiums_id_fk" FOREIGN KEY ("banned_stadium_id") REFERENCES "public"."stadiums"("id") ON DELETE no action ON UPDATE no action;