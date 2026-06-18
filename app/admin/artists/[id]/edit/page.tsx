import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { artists } from "@/db/schema";
import { parseId } from "@/lib/forms";
import { SubmitButton } from "@/components/shared/SubmitButton";
import { updateArtist } from "../../actions";

export default async function EditArtistPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const artistId = parseId(id);
  const db = getDb();
  const artist = await db.query.artists.findFirst({
    where: eq(artists.id, artistId)
  });

  if (!artist) {
    notFound();
  }

  const action = updateArtist.bind(null, artist.id);

  return (
    <section>
      <Link className="text-sm" href="/admin/artists">
        Back to artists
      </Link>
      <h2 className="mt-4 text-xl font-medium">Edit artist</h2>
      <form action={action} className="mt-6 max-w-xl space-y-5">
        <label className="block">
          <span className="text-sm font-medium">Name</span>
          <input className="mt-1 w-full border border-neutral-300 px-3 py-2" defaultValue={artist.name} name="name" required type="text" />
        </label>
        <label className="block">
          <span className="text-sm font-medium">Country</span>
          <input className="mt-1 w-full border border-neutral-300 px-3 py-2" defaultValue={artist.country} name="country" required type="text" />
        </label>
        <label className="block">
          <span className="text-sm font-medium">Genre</span>
          <input className="mt-1 w-full border border-neutral-300 px-3 py-2" defaultValue={artist.genre} name="genre" required type="text" />
        </label>
        <label className="block">
          <span className="text-sm font-medium">Slug</span>
          <input className="mt-1 w-full border border-neutral-300 px-3 py-2" defaultValue={artist.slug} name="slug" required type="text" />
        </label>
        <SubmitButton label="Save artist" />
      </form>
    </section>
  );
}
