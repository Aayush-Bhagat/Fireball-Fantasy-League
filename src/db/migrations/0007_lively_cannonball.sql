CREATE TABLE "rankings" (
	"id" uuid PRIMARY KEY NOT NULL,
	"week" integer NOT NULL,
	"season" integer NOT NULL,
	"url" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "recaps" (
	"id" uuid PRIMARY KEY NOT NULL,
	"week" integer NOT NULL,
	"season" integer NOT NULL,
	"recap" text NOT NULL
);
