import { asc } from "drizzle-orm";
import { getDb } from "@/db/client";
import { artists } from "@/db/schema";

export async function listArtists() {
  const db = getDb();

  return db.query.artists.findMany({
    orderBy: [asc(artists.name)]
  });
}
