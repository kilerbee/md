import Link from "next/link";
import { listCalendarEvents } from "@/db/queries/events";
import { CalendarView } from "@/components/shared/CalendarView";

export const dynamic = "force-dynamic";

export default async function CalendarPage() {
  const events = await listCalendarEvents();

  const serializedEvents = events.map((e) => ({
    id: e.id,
    title: e.title,
    startsAt: e.startsAt.toISOString(),
    endsAt: e.endsAt ? e.endsAt.toISOString() : null,
    eventArtists: e.eventArtists.map((ea) => ({
      artist: { name: ea.artist.name }
    }))
  }));

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <header className="mb-10">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-semibold tracking-normal">Muzički Događaji</h1>
          <div className="flex gap-0.5 rounded-md border border-neutral-300 p-0.5 text-sm">
            <Link href="/" className="rounded px-2.5 py-1 text-neutral-600 hover:text-neutral-900">List</Link>
            <span className="rounded bg-neutral-900 px-2.5 py-1 text-white">Calendar</span>
          </div>
        </div>
      </header>

      <CalendarView events={serializedEvents} />
    </main>
  );
}