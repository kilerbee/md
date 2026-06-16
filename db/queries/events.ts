import { and, asc, desc, eq, gte, inArray, lt } from "drizzle-orm";
import { getDb } from "@/db/client";
import { events } from "@/db/schema";

export async function listUpcomingEvents() {
  const db = getDb();

  return db.query.events.findMany({
    where: and(gte(events.startsAt, new Date()), inArray(events.status, ["published", "announced"])),
    orderBy: [asc(events.startsAt)],
    with: {
      venue: true,
      eventArtists: {
        with: {
          artist: true
        },
        orderBy: (eventArtists, { asc }) => [asc(eventArtists.position)]
      }
    }
  });
}

export async function listPastEvents() {
  const db = getDb();

  return db.query.events.findMany({
    where: and(lt(events.startsAt, new Date()), eq(events.status, "published")),
    orderBy: [desc(events.startsAt)],
    with: {
      venue: true,
      eventArtists: {
        with: {
          artist: true
        },
        orderBy: (eventArtists, { asc }) => [asc(eventArtists.position)]
      }
    }
  });
}
