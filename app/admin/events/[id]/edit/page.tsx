import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { events } from "@/db/schema";
import { toDateInputValue } from "@/lib/formatting/date";
import { parseId } from "@/lib/forms";
import { SubmitButton } from "@/components/shared/SubmitButton";
import { updateEvent } from "../../actions";

export default async function EditEventPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const eventId = parseId(id);
  const db = getDb();
  const [event, artists, venues] = await Promise.all([
    db.query.events.findFirst({
      where: eq(events.id, eventId),
      with: {
        eventArtists: true
      }
    }),
    db.query.artists.findMany({
      orderBy: (artists, { asc }) => [asc(artists.name)]
    }),
    db.query.venues.findMany({
      orderBy: (venues, { asc }) => [asc(venues.city), asc(venues.name)]
    })
  ]);

  if (!event) {
    notFound();
  }

  const selectedArtistIds = new Set(event.eventArtists.map((item) => item.artistId));
  const action = updateEvent.bind(null, event.id);

  return (
    <section>
      <Link className="text-sm" href="/admin/events">
        Back to events
      </Link>
      <h2 className="mt-4 text-xl font-medium">Edit event</h2>
      <form action={action} className="mt-6 max-w-2xl space-y-5">
        <label className="block">
          <span className="text-sm font-medium">Title</span>
          <input className="mt-1 w-full border border-neutral-300 px-3 py-2" defaultValue={event.title} name="title" required type="text" />
        </label>
        <label className="block">
          <span className="text-sm font-medium">Event type</span>
          <input className="mt-1 w-full border border-neutral-300 px-3 py-2" defaultValue={event.eventType} name="event_type" required type="text" />
        </label>
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium">Start date</span>
            <input className="mt-1 w-full border border-neutral-300 px-3 py-2" defaultValue={toDateInputValue(event.startsAt)} name="start_date" required type="date" />
          </label>
          <label className="block">
            <span className="text-sm font-medium">End date</span>
            <input className="mt-1 w-full border border-neutral-300 px-3 py-2" defaultValue={toDateInputValue(event.endsAt)} name="end_date" type="date" />
          </label>
        </div>
        <label className="block">
          <span className="text-sm font-medium">Venue</span>
          <select className="mt-1 w-full border border-neutral-300 px-3 py-2" defaultValue={event.venueId ?? ""} name="venue_id">
            <option value="">No venue</option>
            {venues.map((venue) => (
              <option key={venue.id} value={venue.id}>
                {venue.name}, {venue.city}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-medium">Status</span>
          <select className="mt-1 w-full border border-neutral-300 px-3 py-2" defaultValue={event.status} name="status">
            <option value="announced">Announced</option>
            <option value="cancelled">Cancelled</option>
            <option value="postponed">Postponed</option>
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-medium">Artists</span>
          <select
            className="mt-1 h-48 w-full border border-neutral-300 px-3 py-2"
            defaultValue={Array.from(selectedArtistIds, String)}
            multiple
            name="artist_ids"
          >
            {artists.map((artist) => (
              <option key={artist.id} value={artist.id}>
                {artist.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-medium">Ticket URL</span>
          <input className="mt-1 w-full border border-neutral-300 px-3 py-2" defaultValue={event.ticketUrl ?? ""} name="ticket_url" type="url" />
        </label>
        <label className="block">
          <span className="text-sm font-medium">Source URL</span>
          <input className="mt-1 w-full border border-neutral-300 px-3 py-2" defaultValue={event.sourceUrl ?? ""} name="source_url" type="url" />
        </label>
        <label className="block">
          <span className="text-sm font-medium">Source text</span>
          <textarea className="mt-1 min-h-24 w-full border border-neutral-300 px-3 py-2" defaultValue={event.sourceText ?? ""} name="source_text" />
        </label>
        <label className="block">
          <span className="text-sm font-medium">Notes</span>
          <textarea className="mt-1 min-h-32 w-full border border-neutral-300 px-3 py-2" defaultValue={event.notes ?? ""} name="notes" />
        </label>
        <SubmitButton label="Save event" />
      </form>
    </section>
  );
}
