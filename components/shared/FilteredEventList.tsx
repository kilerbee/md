"use client";

import { useMemo, useState } from "react";
import { EventCard } from "./EventCard";

interface EventWithRelations {
  id: number;
  title: string;
  eventType: string;
  status: string;
  startsAt: string;
  endsAt: string | null;
  venue: { name: string; city: string } | null;
  sourceUrl: string | null;
  ticketUrl: string | null;
  notes: string | null;
  eventArtists: {
    artistId: number;
    artist: {
      name: string;
      country: string;
      genre: string;
    };
  }[];
}

const monthFormatter = new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric" });

export function FilteredEventList({
  events,
  artists,
  cities,
  hideCalendar
}: {
  events: EventWithRelations[];
  artists: string[];
  cities: string[];
  hideCalendar?: boolean;
}) {
  const [selectedArtist, setSelectedArtist] = useState("");
  const [selectedCity, setSelectedCity] = useState("");

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      if (selectedArtist) {
        const hasArtist = event.eventArtists.some(
          (ea) => ea.artist.name === selectedArtist
        );
        if (!hasArtist) return false;
      }
      if (selectedCity) {
        if (event.venue?.city !== selectedCity) return false;
      }
      return true;
    });
  }, [events, selectedArtist, selectedCity]);

  // Group by month
  const monthGroups = useMemo(() => {
    const groups = new Map<string, EventWithRelations[]>();
    for (const event of filteredEvents) {
      const d = new Date(event.startsAt);
      const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, "0")}`;
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(event);
    }
    return groups;
  }, [filteredEvents]);

  return (
    <>
      <div className="sticky top-0 z-10 border-b border-neutral-200 bg-neutral-50 pb-4 pt-4">
        <div className="flex gap-4">
          <select
            className="w-full border border-neutral-300 px-3 py-2 text-sm"
            value={selectedArtist}
            onChange={(e) => setSelectedArtist(e.target.value)}
          >
            <option value="">All artists</option>
            {artists.map((artist) => (
              <option key={artist} value={artist}>
                {artist}
              </option>
            ))}
          </select>
          <select
            className="w-full border border-neutral-300 px-3 py-2 text-sm"
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
          >
            <option value="">All cities</option>
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>
      </div>

      <section aria-label="Events">
        {filteredEvents.length === 0 ? (
          <p className="mt-8 text-neutral-700">No events match the selected filters.</p>
        ) : (
          [...monthGroups.entries()].map(([, group]) => (
            <div key={new Date(group[0].startsAt).toISOString()} className="mb-10 mt-6">
              <h2 className="mb-4 text-lg font-medium text-neutral-600">
                {monthFormatter.format(new Date(group[0].startsAt))}
              </h2>
              <div className="space-y-6">
                {group.map((event) => (
                  <div key={event.id} className="pt-3 border-t border-neutral-200">
                    <EventCard
                      event={{
                        ...event,
                        startsAt: new Date(event.startsAt),
                        endsAt: event.endsAt ? new Date(event.endsAt) : null
                      }}
                      hideCalendar={hideCalendar}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </section>
    </>
  );
}