import Link from "next/link";
import { getDb } from "@/db/client";
import { SubmitButton } from "@/components/shared/SubmitButton";
import { ArtistSelect } from "@/components/shared/ArtistSelect";
import { VenueSelect } from "@/components/shared/VenueSelect";
import { createEvent } from "../actions";

export default async function NewEventPage() {
  const db = getDb();
  const [artists, venues] = await Promise.all([
    db.query.artists.findMany({
      orderBy: (artists, { asc }) => [asc(artists.name)]
    }),
    db.query.venues.findMany({
      orderBy: (venues, { asc }) => [asc(venues.city), asc(venues.name)]
    })
  ]);

  return (
    <section>
      <Link className="text-sm" href="/admin/events">
        Back to events
      </Link>
      <h2 className="mt-4 text-xl font-medium">New event</h2>
      <form action={createEvent} className="mt-6 max-w-2xl space-y-5">
        <label className="block">
          <span className="text-sm font-medium">Title</span>
          <input className="mt-1 w-full border border-neutral-300 px-3 py-2" name="title" required type="text" />
        </label>
        <label className="block">
          <span className="text-sm font-medium">Event type</span>
          <input className="mt-1 w-full border border-neutral-300 px-3 py-2" name="event_type" required type="text" />
        </label>
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium">Start date</span>
            <input className="mt-1 w-full border border-neutral-300 px-3 py-2" name="start_date" required type="date" />
          </label>
          <label className="block">
            <span className="text-sm font-medium">End date</span>
            <input className="mt-1 w-full border border-neutral-300 px-3 py-2" name="end_date" type="date" />
          </label>
        </div>
        <div className="block">
          <VenueSelect venues={venues} />
        </div>
        <label className="block">
          <span className="text-sm font-medium">Status</span>
          <select className="mt-1 w-full border border-neutral-300 px-3 py-2" defaultValue="announced" name="status">
            <option value="announced">Announced</option>
            <option value="cancelled">Cancelled</option>
            <option value="postponed">Postponed</option>
          </select>
        </label>
        <div className="block">
          <ArtistSelect artists={artists} />
        </div>
        <label className="block">
          <span className="text-sm font-medium">Ticket URL</span>
          <input className="mt-1 w-full border border-neutral-300 px-3 py-2" name="ticket_url" type="url" />
        </label>
        <label className="block">
          <span className="text-sm font-medium">Source URL</span>
          <input className="mt-1 w-full border border-neutral-300 px-3 py-2" name="source_url" type="url" />
        </label>
        <label className="block">
          <span className="text-sm font-medium">Source text</span>
          <textarea className="mt-1 min-h-24 w-full border border-neutral-300 px-3 py-2" name="source_text" />
        </label>
        <label className="block">
          <span className="text-sm font-medium">Notes</span>
          <textarea className="mt-1 min-h-32 w-full border border-neutral-300 px-3 py-2" name="notes" />
        </label>
        <SubmitButton label="Create event" />
      </form>
    </section>
  );
}
