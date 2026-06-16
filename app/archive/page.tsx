import Link from "next/link";
import { listPastEvents } from "@/db/queries/events";
import { formatEventDate } from "@/lib/formatting/date";
import { formatArtistWithFlag } from "@/lib/formatting/country-flag";

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
          events.map((event) => (
            <article key={event.id} className="border-t border-neutral-200 pt-5">
              <time className="text-sm text-neutral-600" dateTime={event.startsAt.toISOString()}>
                {formatEventDate(event.startsAt)}
              </time>
              <h2 className="mt-1 text-xl font-medium">{event.title}</h2>
              {event.eventArtists.length > 0 ? (
                <ul className="mt-2 space-y-0.5">
                  {event.eventArtists.map((ea) => (
                    <li key={ea.artistId} className="text-sm text-neutral-700">
                      {formatArtistWithFlag(ea.artist)}
                    </li>
                  ))}
                </ul>
              ) : null}
              <p className="mt-1 text-sm text-neutral-700">
                {[event.venue?.name, event.venue?.city].filter(Boolean).join(", ")}
              </p>
            </article>
          ))
        )}
      </section>
    </main>
  );
}
