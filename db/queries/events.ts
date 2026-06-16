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

export async function listEventsForExport() {
  const db = getDb();
  const now = new Date();

  // Start of current month
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  // Start of month after next month
  const startOfMonthAfterNext = new Date(now.getFullYear(), now.getMonth() + 2, 1);

  return db.query.events.findMany({
    where: and(
      gte(events.startsAt, startOfMonth),
      lt(events.startsAt, startOfMonthAfterNext),
      inArray(events.status, ["published", "announced"])
    ),
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
