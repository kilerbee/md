import { asc } from "drizzle-orm";
import { getDb } from "@/db/client";
import { venues } from "@/db/schema";

export async function listVenues() {
  const db = getDb();

  return db.query.venues.findMany({
    orderBy: [asc(venues.name)]
  });
}
