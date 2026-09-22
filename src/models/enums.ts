import { pgEnum } from "drizzle-orm/pg-core";

export const fieldingPositions = pgEnum("fielding_positions", [
	"C",
	"1B",
	"2B",
	"3B",
	"SS",
	"LF",
	"CF",
	"RF",
	"P",
]);
