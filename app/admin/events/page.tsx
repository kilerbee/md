import Link from "next/link";
import { getDb } from "@/db/client";
import { AdminEventTable } from "./AdminEventTable";

export default async function AdminEventsPage() {
  const db = getDb();
  const eventList = await db.query.events.findMany({
    orderBy: (events, { desc }) => [desc(events.startsAt)],
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

  const serializedEvents = eventList.map((e) => ({
    id: e.id,
    title: e.title,
    startsAt: e.startsAt.toISOString(),
    status: e.status,
    venue: e.venue,
    eventArtists: e.eventArtists.map((ea) => ({
      artist: { name: ea.artist.name }
    }))
  }));

  const allArtists = [
    ...new Set(eventList.flatMap((e) => e.eventArtists.map((ea) => ea.artist.name)))
  ].sort();

  const allVenues = [
    ...new Set(
      eventList.map((e) =>
        e.venue ? `${e.venue.name}, ${e.venue.city}` : "No venue"
      )
    )
  ].sort();

  return (
    <section className="flex h-[calc(100vh-12rem)] flex-col">
      <div className="flex shrink-0 items-center justify-between gap-4">
        <h2 className="text-xl font-medium">Events</h2>
        <Link className="text-sm font-medium" href="/admin/events/new">
          New event
        </Link>
      </div>

      <AdminEventTable
        events={serializedEvents}
        allArtists={allArtists}
        allVenues={allVenues}
      />
    </section>
  );
}