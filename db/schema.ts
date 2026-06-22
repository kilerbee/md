import {
  index,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
  uniqueIndex
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const eventStatus = pgEnum("event_status", ["announced", "cancelled", "postponed"]);

export const artists = pgTable(
  "artists",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    country: text("country").default("").notNull(),
    genre: text("genre").default("").notNull(),
    slug: text("slug").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
  },
  (table) => [
    uniqueIndex("artists_slug_idx").on(table.slug),
    uniqueIndex("artists_name_idx").on(table.name)
  ]
);

export const venues = pgTable(
  "venues",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    city: text("city").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
  },
  (table) => [
    uniqueIndex("venues_slug_idx").on(table.slug),
    uniqueIndex("venues_name_city_idx").on(table.name, table.city)
  ]
);

export const events = pgTable(
  "events",
  {
    id: serial("id").primaryKey(),
    title: text("title").notNull(),
    slug: text("slug").notNull(),
    eventType: text("event_type").default("concert").notNull(),
    startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
    endsAt: timestamp("ends_at", { withTimezone: true }),
    notes: text("notes"),
    venueId: integer("venue_id").references(() => venues.id, { onDelete: "set null" }),
    ticketUrl: text("ticket_url"),
    sourceUrl: text("source_url"),
    sourceText: text("source_text"),
    status: eventStatus("status").default("announced").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
  },
  (table) => [
    uniqueIndex("events_slug_idx").on(table.slug),
    index("events_starts_at_idx").on(table.startsAt),
    index("events_status_idx").on(table.status),
    index("events_venue_id_idx").on(table.venueId)
  ]
);

export const eventArtists = pgTable(
  "event_artists",
  {
    eventId: integer("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    artistId: integer("artist_id")
      .notNull()
      .references(() => artists.id, { onDelete: "cascade" }),
    position: integer("position").default(0).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
  },
  (table) => [
    primaryKey({ columns: [table.eventId, table.artistId] }),
    index("event_artists_event_id_idx").on(table.eventId),
    index("event_artists_artist_id_idx").on(table.artistId)
  ]
);

export const artistsRelations = relations(artists, ({ many }) => ({
  eventArtists: many(eventArtists)
}));

export const venuesRelations = relations(venues, ({ many }) => ({
  events: many(events)
}));

export const eventsRelations = relations(events, ({ one, many }) => ({
  venue: one(venues, {
    fields: [events.venueId],
    references: [venues.id]
  }),
  eventArtists: many(eventArtists)
}));

export const eventArtistsRelations = relations(eventArtists, ({ one }) => ({
  event: one(events, {
    fields: [eventArtists.eventId],
    references: [events.id]
  }),
  artist: one(artists, {
    fields: [eventArtists.artistId],
    references: [artists.id]
  })
}));
