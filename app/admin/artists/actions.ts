"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { artists } from "@/db/schema";
import { requireAdmin } from "@/lib/auth/require-admin";
import { requireString, parseId } from "@/lib/forms";
import { fallbackSlug } from "@/lib/slug";

export async function createArtist(formData: FormData) {
  await requireAdmin();

  const name = requireString(formData, "name");
  const slug = fallbackSlug(requireString(formData, "slug"), name);
  const db = getDb();

  await db.insert(artists).values({
    name,
    country: requireString(formData, "country"),
    genre: requireString(formData, "genre"),
    slug,
    updatedAt: new Date()
  });

  revalidatePath("/admin/artists");
  redirect("/admin/artists");
}

export async function updateArtist(id: number, formData: FormData) {
  await requireAdmin();

  const name = requireString(formData, "name");
  const slug = fallbackSlug(requireString(formData, "slug"), name);
  const db = getDb();

  await db
    .update(artists)
    .set({
      name,
      country: requireString(formData, "country"),
      genre: requireString(formData, "genre"),
      slug,
      updatedAt: new Date()
    })
    .where(eq(artists.id, id));

  revalidatePath("/admin/artists");
  redirect("/admin/artists");
}

export async function deleteArtist(formData: FormData) {
  await requireAdmin();

  const id = parseId(requireString(formData, "id"));
  const db = getDb();

  await db.delete(artists).where(eq(artists.id, id));

  revalidatePath("/admin/artists");
}
