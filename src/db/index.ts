import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as userSchmea from "@/models/users";
import * as teamSchema from "@/models/teams";
import * as playerSchema from "@/models/players";
import * as gameSchema from "@/models/games";
import * as tradeSchema from "@/models/trades";
import * as seasonSchema from "@/models/seasons";
import * as draftSchema from "@/models/draft";

/**
 * Reuse a single pool across Next.js hot reloads and route bundles.
 *
 * `src/db` is imported by every repository, and Next dev can evaluate the
 * module more than once (HMR, plus a bundle per route). A module-level
 * `new Pool()` therefore creates a fresh pool each time, and each pool
 * opens up to `max` connections. That exhausts Supabase's session-mode
 * pooler client limit (15 on the free tier) even though the app only
 * needs a handful of connections. Caching on `globalThis` keeps one pool
 * for the whole Node process.
 */
const globalForDb = globalThis as unknown as { __fflPool?: Pool };

const pool =
	globalForDb.__fflPool ??
	new Pool({
		connectionString: process.env.DATABASE_URL!,
		// Stay comfortably under Supabase's session-mode pooler limit
		// (15 on the free tier). Queries are short, so 5 is plenty.
		max: 5,
		// Close idle connections instead of holding pooler slots.
		idleTimeoutMillis: 10_000,
		// Fail fast instead of hanging when the pool is saturated.
		connectionTimeoutMillis: 10_000,
	});

globalForDb.__fflPool = pool;

export const db = drizzle({
	client: pool,
	schema: {
		...userSchmea,
		...teamSchema,
		...playerSchema,
		...gameSchema,
		...tradeSchema,
		...seasonSchema,
		...draftSchema,
	},
});
