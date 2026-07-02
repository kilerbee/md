import Link from "next/link";
import { SubmitButton } from "@/components/shared/SubmitButton";
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
        <label className="block">
          <span className="text-sm font-medium">Map URL</span>
          <input className="mt-1 w-full border border-neutral-300 px-3 py-2" name="location_url" type="url" />
        </label>
        <SubmitButton label="Create venue" />
      </form>
    </section>
  );
}
