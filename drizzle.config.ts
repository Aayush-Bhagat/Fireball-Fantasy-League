import "dotenv/config";
import { defineConfig } from "drizzle-kit";
export default defineConfig({
	out: "./src/db/migrations",
	schema: "./src/models",
	dialect: "postgresql",
	dbCredentials: {
		url: process.env.DATABASE_URL!,
	},
});
