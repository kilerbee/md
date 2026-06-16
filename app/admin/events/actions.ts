"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { eventArtists, events } from "@/db/schema";
import { requireAdmin } from "@/lib/auth/require-admin";
import { optionalDate, optionalInteger, optionalString, parseId, requireDate, requireString } from "@/lib/forms";
import { fallbackSlug } from "@/lib/slug";

const eventStatuses = ["announced", "cancelled", "postponed"] as const;

type EventStatus = (typeof eventStatuses)[number];

export async function createEvent(formData: FormData) {
  await requireAdmin();

  const title = requireString(formData, "title");
  const db = getDb();

  const [event] = await db
    .insert(events)
    .values({
      title,
      slug: fallbackSlug(`${title}-${Date.now()}`, `event-${Date.now()}`),
      eventType: requireString(formData, "event_type"),
      startsAt: requireDate(formData, "start_date"),
      endsAt: optionalDate(formData, "end_date"),
      venueId: optionalInteger(formData, "venue_id"),
      status: parseStatus(formData),
      ticketUrl: optionalString(formData, "ticket_url"),
      sourceUrl: optionalString(formData, "source_url"),
      sourceText: optionalString(formData, "source_text"),
      notes: optionalString(formData, "notes"),
      updatedAt: new Date()
    })
    .returning({ id: events.id });

  if (!event) {
    throw new Error("Event was not created");
  }

  await replaceEventArtists(event.id, formData);

  revalidatePath("/admin/events");
  revalidatePath("/");
  revalidatePath("/archive");
  redirect("/admin/events");
}

export async function updateEvent(id: number, formData: FormData) {
  await requireAdmin();

  const title = requireString(formData, "title");
  const db = getDb();

  await db
    .update(events)
    .set({
      title,
      slug: fallbackSlug(`${title}-${id}`, `event-${id}`),
      eventType: requireString(formData, "event_type"),
      startsAt: requireDate(formData, "start_date"),
      endsAt: optionalDate(formData, "end_date"),
      venueId: optionalInteger(formData, "venue_id"),
      status: parseStatus(formData),
      ticketUrl: optionalString(formData, "ticket_url"),
      sourceUrl: optionalString(formData, "source_url"),
      sourceText: optionalString(formData, "source_text"),
      notes: optionalString(formData, "notes"),
      updatedAt: new Date()
    })
    .where(eq(events.id, id));

  await replaceEventArtists(id, formData);

  revalidatePath("/admin/events");
  revalidatePath("/");
  revalidatePath("/archive");
  redirect("/admin/events");
}

export async function deleteEvent(formData: FormData) {
  await requireAdmin();

  const id = parseId(requireString(formData, "id"));
  const db = getDb();

  await db.delete(events).where(eq(events.id, id));

  revalidatePath("/admin/events");
  revalidatePath("/");
  revalidatePath("/archive");
}

async function replaceEventArtists(eventId: number, formData: FormData) {
  const db = getDb();
  const artistIds = formData
    .getAll("artist_ids")
    .filter((value): value is string => typeof value === "string" && value !== "")
    .map((value) => parseId(value));

  await db.delete(eventArtists).where(eq(eventArtists.eventId, eventId));

  if (artistIds.length === 0) {
    return;
  }

  await db.insert(eventArtists).values(
    artistIds.map((artistId, index) => ({
      eventId,
      artistId,
      position: index
    }))
  );
}

function parseStatus(formData: FormData): EventStatus {
  const status = requireString(formData, "status");

  if (!eventStatuses.includes(status as EventStatus)) {
    throw new Error("Invalid event status");
  }

  return status as EventStatus;
}
