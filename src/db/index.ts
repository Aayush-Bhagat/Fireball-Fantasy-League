import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as userSchmea from "@/models/users";
import * as teamSchema from "@/models/teams";
import * as playerSchema from "@/models/players";
import * as gameSchema from "@/models/games";
import * as tradeSchema from "@/models/trades";
import * as seasonSchema from "@/models/seasons";

const pool = new Pool({
	connectionString: process.env.DATABASE_URL!,
});

export const db = drizzle({
	client: pool,
	schema: {
		...userSchmea,
		...teamSchema,
		...playerSchema,
		...gameSchema,
		...tradeSchema,
		...seasonSchema,
	},
});
