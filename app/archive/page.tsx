import Link from "next/link";
import { listPastEvents } from "@/db/queries/events";
import { EventCard } from "@/components/shared/EventCard";

export const dynamic = "force-dynamic";

export default async function ArchivePage() {
  const events = await listPastEvents();

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <header className="mb-10">
        <Link className="text-sm" href="/">
          Home
        </Link>
        <h1 className="mt-4 text-3xl font-semibold tracking-normal">Archive</h1>
      </header>

      <section aria-label="Past events" className="space-y-6">
        {events.length === 0 ? (
          <p className="text-neutral-700">The archive is empty.</p>
        ) : (
          events.map((event) => <EventCard key={event.id} event={event} />)
        )}
      </section>
    </main>
  );
}