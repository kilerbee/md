import Link from "next/link";
import { getDb } from "@/db/client";
import { formatEventDate } from "@/lib/formatting/date";
import { deleteEvent } from "./actions";

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

  return (
    <section>
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl font-medium">Events</h2>
        <Link className="text-sm font-medium" href="/admin/events/new">
          New event
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-neutral-200">
              <th className="py-2 pr-4 font-medium">Title</th>
              <th className="py-2 pr-4 font-medium">Date</th>
              <th className="py-2 pr-4 font-medium">Venue</th>
              <th className="py-2 pr-4 font-medium">Artists</th>
              <th className="py-2 pr-4 font-medium">Status</th>
              <th className="py-2 pr-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {eventList.map((event) => (
              <tr key={event.id} className="border-b border-neutral-100 align-top">
                <td className="py-3 pr-4">{event.title}</td>
                <td className="py-3 pr-4">{formatEventDate(event.startsAt)}</td>
                <td className="py-3 pr-4">
                  {event.venue ? `${event.venue.name}, ${event.venue.city}` : "No venue"}
                </td>
                <td className="py-3 pr-4">
                  {event.eventArtists.map((item) => item.artist.name).join(", ") || "No artists"}
                </td>
                <td className="py-3 pr-4 capitalize">{event.status}</td>
                <td className="flex gap-3 py-3 pr-4">
                  <Link href={`/admin/events/${event.id}/edit`}>Edit</Link>
                  <form action={deleteEvent}>
                    <input name="id" type="hidden" value={event.id} />
                    <button className="text-red-700 underline underline-offset-2" type="submit">
                      Delete
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
