"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { venues } from "@/db/schema";
import { requireAdmin } from "@/lib/auth/require-admin";
import { parseId, requireString } from "@/lib/forms";
import { fallbackSlug } from "@/lib/slug";

export async function createVenue(formData: FormData) {
  await requireAdmin();

  const name = requireString(formData, "name");
  const city = requireString(formData, "city");
  const db = getDb();

  await db.insert(venues).values({
    name,
    city,
    slug: fallbackSlug(`${name}-${city}`, name),
    updatedAt: new Date()
  });

  revalidatePath("/admin/venues");
  redirect("/admin/venues");
}

export async function updateVenue(id: number, formData: FormData) {
  await requireAdmin();

  const name = requireString(formData, "name");
  const city = requireString(formData, "city");
  const db = getDb();

  await db
    .update(venues)
    .set({
      name,
      city,
      slug: fallbackSlug(`${name}-${city}`, name),
      updatedAt: new Date()
    })
    .where(eq(venues.id, id));

  revalidatePath("/admin/venues");
  redirect("/admin/venues");
}

export async function deleteVenue(formData: FormData) {
  await requireAdmin();

  const id = parseId(requireString(formData, "id"));
  const db = getDb();

  await db.delete(venues).where(eq(venues.id, id));

  revalidatePath("/admin/venues");
}
