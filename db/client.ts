import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

let database: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function getDb() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required");
  }

  if (!database) {
    const queryClient = postgres(process.env.DATABASE_URL, {
      prepare: false
    });

    database = drizzle(queryClient, { schema });
  }

  return database;
}
