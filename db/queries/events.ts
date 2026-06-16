import { and, asc, desc, eq, gte, inArray, lt } from "drizzle-orm";
import { getDb } from "@/db/client";
import { events } from "@/db/schema";

export async function listUpcomingEvents() {
  const db = getDb();
  const now = new Date();
  // Start of today in the local timezone
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  return db.query.events.findMany({
    where: gte(events.startsAt, startOfToday),
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
  const now = new Date();
  // Start of today in the local timezone
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  return db.query.events.findMany({
    where: lt(events.startsAt, startOfToday),
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
