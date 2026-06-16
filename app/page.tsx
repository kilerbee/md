import Link from "next/link";
import { listUpcomingEvents } from "@/db/queries/events";
import { EventCard } from "@/components/shared/EventCard";

export const dynamic = "force-dynamic";

const monthFormatter = new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric" });

export default async function HomePage() {
  const events = await listUpcomingEvents();

  // Group events by month
  const monthGroups = new Map<string, { label: string; events: typeof events }>();
  for (const event of events) {
    const key = `${event.startsAt.getFullYear()}-${String(event.startsAt.getMonth()).padStart(2, "0")}`;
    if (!monthGroups.has(key)) {
      monthGroups.set(key, { label: monthFormatter.format(event.startsAt), events: [] });
    }
    monthGroups.get(key)!.events.push(event);
  }

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

      <section aria-label="Upcoming events">
        {events.length === 0 ? (
          <p className="text-neutral-700">There are no published upcoming events yet.</p>
        ) : (
          [...monthGroups.values()].map((group) => (
            <div key={group.label} className="mb-10">
              <h2 className="mb-4 text-lg font-medium text-neutral-600">{group.label}</h2>
              <div className="space-y-6">
                {group.events.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </div>
          ))
        )}
      </section>
    </main>
  );
}