import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { venues } from "@/db/schema";
import { parseId } from "@/lib/forms";
import { SubmitButton } from "@/components/shared/SubmitButton";
import { updateVenue } from "../../actions";

export default async function EditVenuePage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const venueId = parseId(id);
  const db = getDb();
  const venue = await db.query.venues.findFirst({
    where: eq(venues.id, venueId)
  });

  if (!venue) {
    notFound();
  }

  const action = updateVenue.bind(null, venue.id);

  return (
    <section>
      <Link className="text-sm" href="/admin/venues">
        Back to venues
      </Link>
      <h2 className="mt-4 text-xl font-medium">Edit venue</h2>
      <form action={action} className="mt-6 max-w-xl space-y-5">
        <label className="block">
          <span className="text-sm font-medium">Name</span>
          <input className="mt-1 w-full border border-neutral-300 px-3 py-2" defaultValue={venue.name} name="name" required type="text" />
        </label>
        <label className="block">
          <span className="text-sm font-medium">City</span>
          <input className="mt-1 w-full border border-neutral-300 px-3 py-2" defaultValue={venue.city} name="city" required type="text" />
        </label>
        <label className="block">
          <span className="text-sm font-medium">Map URL</span>
          <input className="mt-1 w-full border border-neutral-300 px-3 py-2" defaultValue={venue.locationUrl ?? ""} name="location_url" type="url" />
        </label>
        <div className="rounded border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-600">
          <span className="font-medium">Slug: </span>
          {venue.slug}
        </div>
        <SubmitButton label="Save venue" />
      </form>
    </section>
  );
}
