import { listCalendarEvents } from "@/db/queries/events";
import { CalendarView } from "@/components/shared/CalendarView";
import { VIEWS } from "@/lib/constants";
import { ViewSwitch } from "@/components/shared/ViewSwitch";

export const dynamic = "force-dynamic";

export default async function CalendarPage() {
  const events = await listCalendarEvents();

  const serializedEvents = events.map((e) => ({
    id: e.id,
    title: e.title,
    eventType: e.eventType,
    status: e.status,
    startsAt: e.startsAt.toISOString(),
    endsAt: e.endsAt ? e.endsAt.toISOString() : null,
    venue: e.venue ? { name: e.venue.name, city: e.venue.city, locationUrl: e.venue.locationUrl } : null,
    sourceUrl: e.sourceUrl,
    ticketUrl: e.ticketUrl,
    notes: e.notes,
    eventArtists: e.eventArtists.map((ea) => ({
      artistId: ea.artistId,
      artist: {
        name: ea.artist.name,
        country: ea.artist.country,
        genre: ea.artist.genre
      }
    }))
  }));

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <header className="mb-10">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-semibold tracking-normal">Muzički Događaji</h1>
          <ViewSwitch views={VIEWS} currentView="Calendar" />
        </div>
      </header>

      <CalendarView events={serializedEvents} />
    </main>
  );
}