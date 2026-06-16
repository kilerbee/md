import Link from "next/link";
import { getDb } from "@/db/client";
import { deleteArtist } from "./actions";

export default async function AdminArtistsPage() {
  const db = getDb();
  const artistList = await db.query.artists.findMany({
    orderBy: (artists, { asc }) => [asc(artists.name)]
  });

  return (
    <section>
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl font-medium">Artists</h2>
        <Link className="text-sm font-medium" href="/admin/artists/new">
          New artist
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-neutral-200">
              <th className="py-2 pr-4 font-medium">Name</th>
              <th className="py-2 pr-4 font-medium">Country</th>
              <th className="py-2 pr-4 font-medium">Genre</th>
              <th className="py-2 pr-4 font-medium">Slug</th>
              <th className="py-2 pr-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {artistList.map((artist) => (
              <tr key={artist.id} className="border-b border-neutral-100">
                <td className="py-3 pr-4">{artist.name}</td>
                <td className="py-3 pr-4">{artist.country}</td>
                <td className="py-3 pr-4">{artist.genre}</td>
                <td className="py-3 pr-4">{artist.slug}</td>
                <td className="flex gap-3 py-3 pr-4">
                  <Link href={`/admin/artists/${artist.id}/edit`}>Edit</Link>
                  <form action={deleteArtist}>
                    <input name="id" type="hidden" value={artist.id} />
                    <button className="text-red-700 underline underline-offset-2" type="submit">
                      Delete
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
