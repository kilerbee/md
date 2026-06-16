import Link from "next/link";
import { listUpcomingEvents } from "@/db/queries/events";
import { EventCard } from "@/components/shared/EventCard";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const events = await listUpcomingEvents();

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <header className="mb-10">
        <h1 className="text-3xl font-semibold tracking-normal">Muzički Događaji</h1>
        <p className="mt-3 text-base text-neutral-700">
          A chronological catalog of concerts, festivals, and related events in Serbia.
        </p>
        <nav className="mt-5 text-sm">
          <Link href="/archive">Archive</Link>
        </nav>
      </header>

      <section aria-label="Upcoming events" className="space-y-6">
        {events.length === 0 ? (
          <p className="text-neutral-700">There are no published upcoming events yet.</p>
        ) : (
          events.map((event) => <EventCard key={event.id} event={event} />)
        )}
      </section>
    </main>
  );
}