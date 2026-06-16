import Link from "next/link";
import { createArtist } from "../actions";

export default function NewArtistPage() {
  return (
    <section>
      <Link className="text-sm" href="/admin/artists">
        Back to artists
      </Link>
      <h2 className="mt-4 text-xl font-medium">New artist</h2>
      <form action={createArtist} className="mt-6 max-w-xl space-y-5">
        <ArtistFields />
        <button className="border border-neutral-900 px-4 py-2 text-sm font-medium" type="submit">
          Create artist
        </button>
      </form>
    </section>
  );
}

function ArtistFields() {
  return (
    <>
      <label className="block">
        <span className="text-sm font-medium">Name</span>
        <input className="mt-1 w-full border border-neutral-300 px-3 py-2" name="name" required type="text" />
      </label>
      <label className="block">
        <span className="text-sm font-medium">Country</span>
        <input className="mt-1 w-full border border-neutral-300 px-3 py-2" name="country" required type="text" />
      </label>
      <label className="block">
        <span className="text-sm font-medium">Genre</span>
        <input className="mt-1 w-full border border-neutral-300 px-3 py-2" name="genre" required type="text" />
      </label>
      <label className="block">
        <span className="text-sm font-medium">Slug</span>
        <input className="mt-1 w-full border border-neutral-300 px-3 py-2" name="slug" required type="text" />
      </label>
    </>
  );
}
