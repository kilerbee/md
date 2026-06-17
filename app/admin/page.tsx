import { listEventsForExport } from "@/db/queries/events";
import { Export } from "@/components/shared/Export";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const events = await listEventsForExport();

  const serializedEvents = events.map((e) => ({
    ...e,
    startsAt: e.startsAt.toISOString()
  }));

  return (
    <section>
      <p className="mt-2 text-sm text-neutral-700">
        Events from the current and next month. Click to select all, then copy.
      </p>
      <Export events={serializedEvents} />
    </section>
  );
}