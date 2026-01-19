import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "@/unused_db/db_migration_env.mjs";

const client = postgres(env.DATABASE_URL);
export const db = drizzle(client);

