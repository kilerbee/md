import Link from "next/link";
import { getDb } from "@/db/client";
import { DeleteButton } from "@/components/shared/DeleteButton";
import { deleteVenue } from "./actions";

export default async function AdminVenuesPage() {
  const db = getDb();
  const venueList = await db.query.venues.findMany({
    orderBy: (venues, { asc }) => [asc(venues.city), asc(venues.name)]
  });

  return (
    <section>
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl font-medium">Venues</h2>
        <Link className="text-sm font-medium" href="/admin/venues/new">
          New venue
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-neutral-200">
              <th className="py-2 pr-4 font-medium">Name</th>
              <th className="py-2 pr-4 font-medium">City</th>
              <th className="py-2 pr-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {venueList.map((venue) => (
              <tr key={venue.id} className="border-b border-neutral-100 even:bg-neutral-100">
                <td className="py-3 pr-4">{venue.name}</td>
                <td className="py-3 pr-4">{venue.city}</td>
                <td className="flex gap-3 py-3 pr-4">
                  <Link href={`/admin/venues/${venue.id}/edit`}>Edit</Link>
                  <DeleteButton action={deleteVenue} id={venue.id} label="Delete this venue?" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
