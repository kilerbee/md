import Link from "next/link";
import { listUpcomingEvents } from "@/db/queries/events";
import { FilteredEventList } from "@/components/shared/FilteredEventList";
import { VIEWS } from "@/lib/constants";
import { ViewSwitch } from "@/components/shared/ViewSwitch";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const events = await listUpcomingEvents();

  const serializedEvents = events.map((e) => ({
    ...e,
    startsAt: e.startsAt.toISOString(),
    endsAt: e.endsAt ? e.endsAt.toISOString() : null
  }));

  const artists = [...new Set(events.flatMap((e) => e.eventArtists.map((ea) => ea.artist.name)))].sort();
  const cities = [...new Set(events.map((e) => e.venue?.city).filter((c): c is string => !!c))].sort();

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <header className="mb-10">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-semibold tracking-normal">Muzički Događaji</h1>
          <ViewSwitch views={VIEWS} currentView="List" />
        </div>
        <nav className="mt-5 text-sm">
          <Link href="/archive">Archive</Link>
        </nav>
      </header>

      <FilteredEventList events={serializedEvents} artists={artists} cities={cities} />
    </main>
  );
}