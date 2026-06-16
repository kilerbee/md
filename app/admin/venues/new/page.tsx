import Link from "next/link";
import { createVenue } from "../actions";

export default function NewVenuePage() {
  return (
    <section>
      <Link className="text-sm" href="/admin/venues">
        Back to venues
      </Link>
      <h2 className="mt-4 text-xl font-medium">New venue</h2>
      <form action={createVenue} className="mt-6 max-w-xl space-y-5">
        <label className="block">
          <span className="text-sm font-medium">Name</span>
          <input className="mt-1 w-full border border-neutral-300 px-3 py-2" name="name" required type="text" />
        </label>
        <label className="block">
          <span className="text-sm font-medium">City</span>
          <input className="mt-1 w-full border border-neutral-300 px-3 py-2" name="city" required type="text" />
        </label>
        <button className="border border-neutral-900 px-4 py-2 text-sm font-medium" type="submit">
          Create venue
        </button>
      </form>
    </section>
  );
}
