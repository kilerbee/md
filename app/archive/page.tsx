import Link from "next/link";
import { listPastEvents } from "@/db/queries/events";
import { FilteredEventList } from "@/components/shared/FilteredEventList";

export const dynamic = "force-dynamic";

export default async function ArchivePage() {
  const events = await listPastEvents();

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
        <Link className="text-sm" href="/">
          Home
        </Link>
        <h1 className="mt-4 text-3xl font-semibold tracking-normal">Archive</h1>
      </header>

      <FilteredEventList events={serializedEvents} artists={artists} cities={cities} hideCalendar />
    </main>
  );
}