"use server";

import { revalidatePath } from "next/cache";
import { eq, asc } from "drizzle-orm";
import { getDb } from "@/db/client";
import { artists } from "@/db/schema";
import { requireAdmin } from "@/lib/auth/require-admin";
import { fallbackSlug } from "@/lib/slug";

export async function quickCreateArtist(name: string, country: string, genre: string) {
  await requireAdmin();

  const db = getDb();

  const existing = await db.query.artists.findFirst({
    where: eq(artists.name, name),
    columns: { id: true, name: true, country: true, genre: true }
  });

  if (existing) {
    return { artist: existing, allArtists: await listAllArtists() };
  }

  const slug = fallbackSlug(name, `artist-${Date.now()}`);
  const [artist] = await db
    .insert(artists)
    .values({
      name,
      country,
      genre,
      slug,
      updatedAt: new Date()
    })
    .returning({ id: artists.id, name: artists.name, country: artists.country, genre: artists.genre });

  revalidatePath("/admin/events/new");
  revalidatePath("/admin/events/[id]/edit");
  revalidatePath("/admin/events");
  revalidatePath("/admin/artists");

  return { artist, allArtists: await listAllArtists() };
}

async function listAllArtists() {
  const db = getDb();
  return db.query.artists.findMany({
    orderBy: [asc(artists.name)],
    columns: { id: true, name: true, country: true, genre: true }
  });
}