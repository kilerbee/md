"use server";

import { revalidatePath } from "next/cache";
import { eq, asc } from "drizzle-orm";
import { getDb } from "@/db/client";
import { venues } from "@/db/schema";
import { requireAdmin } from "@/lib/auth/require-admin";
import { fallbackSlug } from "@/lib/slug";

export interface VenueItem {
  id: number;
  name: string;
  city: string;
  locationUrl: string | null;
}

export async function quickCreateVenue(name: string, city: string, locationUrl?: string) {
  await requireAdmin();

  const db = getDb();

  const existing = await db.query.venues.findFirst({
    where: eq(venues.name, name),
    columns: { id: true, name: true, city: true, locationUrl: true }
  });

  if (existing) {
    return { venue: existing, allVenues: await listAllVenues() };
  }

  const slug = fallbackSlug(`${name}-${city}`, name);
  const [venue] = await db
    .insert(venues)
    .values({
      name,
      city,
      locationUrl: locationUrl ?? null,
      slug,
      updatedAt: new Date()
    })
    .returning({ id: venues.id, name: venues.name, city: venues.city, locationUrl: venues.locationUrl });

  revalidatePath("/admin/events/new");
  revalidatePath("/admin/events/[id]/edit");
  revalidatePath("/admin/events");
  revalidatePath("/admin/venues");

  return { venue, allVenues: await listAllVenues() };
}

async function listAllVenues() {
  const db = getDb();
  return db.query.venues.findMany({
    orderBy: [asc(venues.city), asc(venues.name)],
    columns: { id: true, name: true, city: true, locationUrl: true }
  });
}
