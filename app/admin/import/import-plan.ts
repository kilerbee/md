import { and, eq, sql } from "drizzle-orm";
import { getDb } from "@/db/client";
import { artists, eventArtists, events, venues } from "@/db/schema";
import { fallbackSlug } from "@/lib/slug";
import {
  allowedEventTypes,
  allowedImportStatuses,
  type ImportArtist,
  type ImportEvent,
  type ImportEventType,
  type ImportPlan,
  type ImportStatus,
  type ImportVenue
} from "./types";

type RawArtist = {
  name: string;
  country: string;
  genre: string;
};

type RawVenue = {
  name: string;
  city: string;
};

type RawEvent = {
  externalId: string;
  title: string;
  eventType: ImportEventType;
  status: ImportStatus;
  startDate: string;
  endDate: string | null;
  venue: RawVenue;
  artists: RawArtist[];
  ticketUrl: string | null;
  sourceUrl: string | null;
  notes: string | null;
  sourceText: string | null;
};

export async function buildImportPlan(input: string): Promise<ImportPlan> {
  const errors: string[] = [];
  const warnings: string[] = [];
  const rawEvents = parseInput(input, errors);

  if (errors.length > 0) {
    return emptyPlan(errors, warnings);
  }

  const db = getDb();
  const [existingArtists, existingVenues, existingEvents] = await Promise.all([
    db.select().from(artists),
    db.select().from(venues),
    db.query.events.findMany({
      with: {
        venue: true
      }
    })
  ]);

  const existingArtistByKey = new Map(existingArtists.map((artist) => [artistKey(artist.name), artist]));
  const existingVenueByKey = new Map(existingVenues.map((venue) => [venueKey(venue.name, venue.city), venue]));
  const existingEventKeys = new Set(
    existingEvents.map((event) => eventKey(event.title, toDateOnly(event.startsAt), event.venue?.name ?? "", event.venue?.city ?? ""))
  );
  const usedArtistSlugs = new Set(existingArtists.map((artist) => artist.slug));
  const usedVenueSlugs = new Set(existingVenues.map((venue) => venue.slug));
  const usedEventSlugs = new Set(existingEvents.map((event) => event.slug));

  const artistsToCreateByKey = new Map<string, ImportArtist>();
  const artistsExistingByKey = new Map<string, ImportArtist>();
  const venuesToCreateByKey = new Map<string, ImportVenue>();
  const venuesExistingByKey = new Map<string, ImportVenue>();
  const eventsToCreate: ImportEvent[] = [];
  const eventsExisting: ImportEvent[] = [];
  const plannedEventKeys = new Set<string>();

  for (const rawEvent of rawEvents) {
    const rawVenueKey = venueKey(rawEvent.venue.name, rawEvent.venue.city);
    const existingVenue = existingVenueByKey.get(rawVenueKey);

    if (existingVenue) {
      venuesExistingByKey.set(rawVenueKey, toImportVenue(existingVenue, usedVenueSlugs));
    } else {
      const importVenue = toImportVenue(rawEvent.venue, usedVenueSlugs);
      venuesToCreateByKey.set(rawVenueKey, importVenue);
    }

    const artistKeys: string[] = [];

    for (const rawArtist of rawEvent.artists) {
      const rawArtistKey = artistKey(rawArtist.name);
      const existingArtist = existingArtistByKey.get(rawArtistKey);

      artistKeys.push(rawArtistKey);

      if (existingArtist) {
        artistsExistingByKey.set(rawArtistKey, toImportArtist(existingArtist, usedArtistSlugs));

        if (existingArtist.country !== rawArtist.country) {
          warnings.push(
            `Artist "${rawArtist.name}" already exists with country "${existingArtist.country}", imported country is "${rawArtist.country}". Existing data will not be overwritten.`
          );
        }

        if (existingArtist.genre !== rawArtist.genre) {
          warnings.push(
            `Artist "${rawArtist.name}" already exists with genre "${existingArtist.genre}", imported genre is "${rawArtist.genre}". Existing data will not be overwritten.`
          );
        }
      } else if (artistsToCreateByKey.has(rawArtistKey)) {
        const plannedArtist = artistsToCreateByKey.get(rawArtistKey);

        if (plannedArtist && (plannedArtist.country !== rawArtist.country || plannedArtist.genre !== rawArtist.genre)) {
          warnings.push(
            `Artist "${rawArtist.name}" appears more than once with different country or genre values. The first imported value will be used.`
          );
        }
      } else {
        const importArtist = toImportArtist(rawArtist, usedArtistSlugs);
        artistsToCreateByKey.set(rawArtistKey, importArtist);
      }
    }

    const rawEventKey = eventKey(rawEvent.title, rawEvent.startDate, rawEvent.venue.name, rawEvent.venue.city);

    if (existingEventKeys.has(rawEventKey)) {
      const importEvent = toImportEvent(rawEvent, rawVenueKey, artistKeys, null);
      warnings.push(`Event "${rawEvent.title}" on ${rawEvent.startDate} at ${rawEvent.venue.name}, ${rawEvent.venue.city} already exists and will be skipped.`);
      eventsExisting.push(importEvent);
    } else if (plannedEventKeys.has(rawEventKey)) {
      const importEvent = toImportEvent(rawEvent, rawVenueKey, artistKeys, null);
      warnings.push(`Duplicate event "${rawEvent.title}" on ${rawEvent.startDate} at ${rawEvent.venue.name}, ${rawEvent.venue.city} appears in the import file and will be skipped after the first occurrence.`);
      eventsExisting.push(importEvent);
    } else {
      const importEvent = toImportEvent(rawEvent, rawVenueKey, artistKeys, usedEventSlugs);
      plannedEventKeys.add(rawEventKey);
      eventsToCreate.push(importEvent);
    }
  }

  return {
    version: 1,
    generatedAt: new Date().toISOString(),
    artistsToCreate: [...artistsToCreateByKey.values()],
    artistsExisting: [...artistsExistingByKey.values()],
    venuesToCreate: [...venuesToCreateByKey.values()],
    venuesExisting: [...venuesExistingByKey.values()],
    eventsToCreate,
    eventsExisting,
    warnings,
    errors
  };
}

export async function executeImportPlan(plan: ImportPlan) {
  if (plan.errors.length > 0) {
    throw new Error("Cannot import a plan with validation errors");
  }

  const db = getDb();

  await db.transaction(async (tx) => {
    const artistIdByKey = new Map<string, number>();
    const venueIdByKey = new Map<string, number>();

    const allArtistNames = [...plan.artistsExisting, ...plan.artistsToCreate].map((artist) => artist.name);
    const allVenues = [...plan.venuesExisting, ...plan.venuesToCreate];

    for (const name of allArtistNames) {
      const [existingArtist] = await tx
        .select()
        .from(artists)
        .where(sql`lower(${artists.name}) = lower(${name})`)
        .limit(1);

      if (existingArtist) {
        artistIdByKey.set(artistKey(existingArtist.name), existingArtist.id);
      }
    }

    for (const artist of plan.artistsToCreate) {
      if (artistIdByKey.has(artistKey(artist.name))) {
        continue;
      }

      const [createdArtist] = await tx
        .insert(artists)
        .values({
          name: artist.name,
          country: artist.country,
          genre: artist.genre,
          slug: artist.slug,
          updatedAt: new Date()
        })
        .returning({ id: artists.id });

      if (!createdArtist) {
        throw new Error(`Failed to create artist "${artist.name}"`);
      }

      artistIdByKey.set(artistKey(artist.name), createdArtist.id);
    }

    for (const venue of allVenues) {
      const [existingVenue] = await tx
        .select()
        .from(venues)
        .where(and(sql`lower(${venues.name}) = lower(${venue.name})`, sql`lower(${venues.city}) = lower(${venue.city})`))
        .limit(1);

      if (existingVenue) {
        venueIdByKey.set(venueKey(existingVenue.name, existingVenue.city), existingVenue.id);
      }
    }

    for (const venue of plan.venuesToCreate) {
      if (venueIdByKey.has(venueKey(venue.name, venue.city))) {
        continue;
      }

      const [createdVenue] = await tx
        .insert(venues)
        .values({
          name: venue.name,
          city: venue.city,
          slug: venue.slug,
          updatedAt: new Date()
        })
        .returning({ id: venues.id });

      if (!createdVenue) {
        throw new Error(`Failed to create venue "${venue.name}"`);
      }

      venueIdByKey.set(venueKey(venue.name, venue.city), createdVenue.id);
    }

    for (const plannedEvent of plan.eventsToCreate) {
      const venueId = venueIdByKey.get(plannedEvent.venueKey);

      if (!venueId) {
        throw new Error(`Venue missing for event "${plannedEvent.title}"`);
      }

      const [duplicateEvent] = await tx
        .select({ id: events.id })
        .from(events)
        .where(
          and(
            sql`lower(${events.title}) = lower(${plannedEvent.title})`,
            eq(events.startsAt, parseDate(plannedEvent.startDate)),
            eq(events.venueId, venueId)
          )
        )
        .limit(1);

      if (duplicateEvent) {
        throw new Error(`Event "${plannedEvent.title}" on ${plannedEvent.startDate} already exists. Generate a new preview before importing.`);
      }

      const [createdEvent] = await tx
        .insert(events)
        .values({
          title: plannedEvent.title,
          slug: plannedEvent.slug,
          eventType: plannedEvent.eventType,
          startsAt: parseDate(plannedEvent.startDate),
          endsAt: plannedEvent.endDate ? parseDate(plannedEvent.endDate) : null,
          venueId,
          status: plannedEvent.status,
          ticketUrl: plannedEvent.ticketUrl,
          sourceUrl: plannedEvent.sourceUrl,
          sourceText: plannedEvent.sourceText,
          notes: plannedEvent.notes,
          updatedAt: new Date()
        })
        .returning({ id: events.id });

      if (!createdEvent) {
        throw new Error(`Failed to create event "${plannedEvent.title}"`);
      }

      const uniqueArtistIds = [...new Set(plannedEvent.artistKeys.map((key) => artistIdByKey.get(key)))].filter(
        (id): id is number => typeof id === "number"
      );

      if (uniqueArtistIds.length > 0) {
        await tx.insert(eventArtists).values(
          uniqueArtistIds.map((artistId, index) => ({
            eventId: createdEvent.id,
            artistId,
            position: index
          }))
        );
      }
    }
  });
}

function parseInput(input: string, errors: string[]) {
  let parsed: unknown;

  try {
    parsed = JSON.parse(input);
  } catch (error) {
    errors.push(`Invalid JSON: ${error instanceof Error ? error.message : "Unable to parse input."}`);
    return [];
  }

  if (!isRecord(parsed) || !Array.isArray(parsed.events)) {
    errors.push('Input must be an object with an "events" array.');
    return [];
  }

  const rawEvents: RawEvent[] = [];

  parsed.events.forEach((value, index) => {
    const eventErrors: string[] = [];
    const event = parseEvent(value, index, eventErrors);

    errors.push(...eventErrors);

    if (event) {
      rawEvents.push(event);
    }
  });

  return rawEvents;
}

function parseEvent(value: unknown, index: number, errors: string[]): RawEvent | null {
  const path = `events[${index}]`;

  if (!isRecord(value)) {
    errors.push(`${path} must be an object.`);
    return null;
  }

  const title = readRequiredString(value, "title", path, errors);
  const externalId = readRequiredString(value, "externalId", path, errors);
  const eventType = readEnum(value, "eventType", allowedEventTypes, path, errors);
  const status = readEnum(value, "status", allowedImportStatuses, path, errors);
  const startDate = readRequiredDate(value, "startDate", path, errors);
  const endDate = readOptionalDate(value, "endDate", path, errors);
  const venue = readVenue(value.venue, path, errors);
  const parsedArtists = readArtists(value.artists, path, errors);

  if (!externalId || !title || !eventType || !status || !startDate || !venue || !parsedArtists) {
    return null;
  }

  if (endDate && endDate < startDate) {
    errors.push(`${path}.endDate must be after or equal to startDate.`);
    return null;
  }

  return {
    externalId,
    title,
    eventType,
    status,
    startDate,
    endDate,
    venue,
    artists: parsedArtists,
    ticketUrl: readOptionalUrl(value, "ticketUrl", path, errors),
    sourceUrl: readOptionalUrl(value, "sourceUrl", path, errors),
    notes: readOptionalString(value, "notes", path, errors),
    sourceText: readOptionalString(value, "sourceText", path, errors)
  };
}

function readVenue(value: unknown, path: string, errors: string[]): RawVenue | null {
  if (!isRecord(value)) {
    errors.push(`${path}.venue must be an object.`);
    return null;
  }

  const name = readRequiredString(value, "name", `${path}.venue`, errors);
  const city = readRequiredString(value, "city", `${path}.venue`, errors);

  if (!name || !city) {
    return null;
  }

  return { name, city };
}

function readArtists(value: unknown, path: string, errors: string[]) {
  if (!Array.isArray(value)) {
    errors.push(`${path}.artists must be an array.`);
    return null;
  }

  const parsedArtists: RawArtist[] = [];

  value.forEach((artist, index) => {
    const artistPath = `${path}.artists[${index}]`;

    if (!isRecord(artist)) {
      errors.push(`${artistPath} must be an object.`);
      return;
    }

    const name = readRequiredString(artist, "name", artistPath, errors);
    const country = readRequiredString(artist, "country", artistPath, errors);
    const genre = readRequiredString(artist, "genre", artistPath, errors);

    if (name && country && genre) {
      parsedArtists.push({ name, country, genre });
    }
  });

  return parsedArtists;
}

function emptyPlan(errors: string[], warnings: string[]): ImportPlan {
  return {
    version: 1,
    generatedAt: new Date().toISOString(),
    artistsToCreate: [],
    artistsExisting: [],
    venuesToCreate: [],
    venuesExisting: [],
    eventsToCreate: [],
    eventsExisting: [],
    warnings,
    errors
  };
}

function toImportArtist(artist: RawArtist | typeof artists.$inferSelect, usedSlugs: Set<string>): ImportArtist {
  const existingSlug = "slug" in artist ? artist.slug : null;

  return {
    name: artist.name,
    country: artist.country,
    genre: artist.genre,
    slug: existingSlug ?? uniqueSlug(fallbackSlug(artist.name, artist.name), usedSlugs)
  };
}

function toImportVenue(venue: RawVenue | typeof venues.$inferSelect, usedSlugs: Set<string>): ImportVenue {
  const existingSlug = "slug" in venue ? venue.slug : null;

  return {
    name: venue.name,
    city: venue.city,
    slug: existingSlug ?? uniqueSlug(fallbackSlug(`${venue.name}-${venue.city}`, venue.name), usedSlugs)
  };
}

function toImportEvent(event: RawEvent, venueKeyValue: string, artistKeys: string[], usedSlugs: Set<string> | null): ImportEvent {
  const baseSlug = fallbackSlug(`${event.title}-${event.startDate}-${event.venue.name}`, event.title);

  return {
    externalId: event.externalId,
    title: event.title,
    slug: usedSlugs ? uniqueSlug(baseSlug, usedSlugs) : baseSlug,
    eventType: event.eventType,
    status: event.status,
    startDate: event.startDate,
    endDate: event.endDate,
    venueKey: venueKeyValue,
    artistKeys,
    ticketUrl: event.ticketUrl,
    sourceUrl: event.sourceUrl,
    notes: event.notes,
    sourceText: event.sourceText
  };
}

function readRequiredString(value: Record<string, unknown>, key: string, path: string, errors: string[]) {
  const field = value[key];

  if (typeof field !== "string" || field.trim() === "") {
    errors.push(`${path}.${key} is required.`);
    return null;
  }

  return field.trim();
}

function readOptionalString(value: Record<string, unknown>, key: string, path: string, errors: string[]) {
  const field = value[key];

  if (field === null || field === undefined) {
    return null;
  }

  if (typeof field !== "string") {
    errors.push(`${path}.${key} must be a string or null.`);
    return null;
  }

  const trimmed = field.trim();

  return trimmed === "" ? null : trimmed;
}

function readOptionalUrl(value: Record<string, unknown>, key: string, path: string, errors: string[]) {
  const field = readOptionalString(value, key, path, errors);

  if (!field) {
    return null;
  }

  try {
    return new URL(field).toString();
  } catch {
    errors.push(`${path}.${key} must be a valid URL.`);
    return null;
  }
}

function readEnum<T extends readonly string[]>(value: Record<string, unknown>, key: string, allowed: T, path: string, errors: string[]) {
  const field = readRequiredString(value, key, path, errors);

  if (!field) {
    return null;
  }

  if (!(allowed as readonly string[]).includes(field)) {
    errors.push(`${path}.${key} must be one of: ${allowed.join(", ")}.`);
    return null;
  }

  return field as T[number];
}

function readRequiredDate(value: Record<string, unknown>, key: string, path: string, errors: string[]) {
  const field = readRequiredString(value, key, path, errors);

  if (!field) {
    return null;
  }

  if (!isDateOnly(field)) {
    errors.push(`${path}.${key} must use YYYY-MM-DD format.`);
    return null;
  }

  return field;
}

function readOptionalDate(value: Record<string, unknown>, key: string, path: string, errors: string[]) {
  const field = value[key];

  if (field === null || field === undefined || field === "") {
    return null;
  }

  if (typeof field !== "string" || !isDateOnly(field)) {
    errors.push(`${path}.${key} must use YYYY-MM-DD format or null.`);
    return null;
  }

  return field;
}

function isDateOnly(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  return toDateOnly(parseDate(value)) === value;
}

function parseDate(value: string) {
  return new Date(`${value}T00:00:00.000Z`);
}

function toDateOnly(date: Date) {
  return date.toISOString().slice(0, 10);
}

function artistKey(name: string) {
  return name.trim().toLowerCase();
}

function venueKey(name: string, city: string) {
  return `${name.trim().toLowerCase()}::${city.trim().toLowerCase()}`;
}

function eventKey(title: string, startDate: string, venueName: string, venueCity: string) {
  return `${title.trim().toLowerCase()}::${startDate}::${venueKey(venueName, venueCity)}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function uniqueSlug(baseSlug: string, usedSlugs: Set<string>) {
  let candidate = baseSlug;
  let index = 2;

  while (usedSlugs.has(candidate)) {
    candidate = `${baseSlug}-${index}`;
    index += 1;
  }

  usedSlugs.add(candidate);

  return candidate;
}
