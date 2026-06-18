"use client";

import { CopyTextarea } from "./CopyTextarea";
import { getArtistFlag } from "@/lib/formatting/country-flag";
import { EVENT_TYPE_FEST } from "@/lib/constants";

interface ExportEvent {
  title: string;
  eventType: string;
  status: string;
  startsAt: string;
  sourceUrl: string | null;
  ticketUrl: string | null;
  notes: string | null;
  venue: { name: string; city: string } | null;
  eventArtists: {
    artist: {
      name: string;
      country: string;
      genre: string;
    };
  }[];
}

export function Export({ events }: { events: ExportEvent[] }) {
  const lines = events.map((event) => {
    const d = new Date(event.startsAt);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");

    const artistParts = event.eventArtists.map((ea) => {
      const flag = getArtistFlag(ea.artist);
      const flagPart = flag ? `${flag} ` : "";
      const genrePart = ea.artist.genre ? ` (${ea.artist.genre})` : "";
      return { name: `${flagPart}${ea.artist.name}`, genre: genrePart };
    });

    const prefix = event.eventType === EVENT_TYPE_FEST || artistParts.length === 0 ? (
      <strong>{event.title}</strong>
    ) : (
      artistParts.map((ap, i) => (
        <span key={i}>
          {i > 0 ? <>, </> : null}
          <strong>{ap.name}</strong>{ap.genre}
        </span>
      ))
    );
    const city = event.venue?.city ?? "";
    const venue = event.venue?.name ?? "";
    const url = event.ticketUrl || event.sourceUrl || "";

    const suffix = [city, venue, url].filter(Boolean).join(", ");

    const isStruck = event.status === "cancelled";

    return (
      <div key={event.startsAt + event.title}>
        {isStruck ? (
          <>
            <s>
              {day}.{month} - {prefix}
              {suffix ? <>, {suffix}</> : null}
            </s>
            {event.notes ? (
              <strong className="font-bold"> - {event.notes}</strong>
            ) : null}
          </>
        ) : (
          <span>
            {day}.{month} - {prefix}
            {suffix ? <>, {suffix}</> : null}
          </span>
        )}
      </div>
    );
  });

  return <CopyTextarea>{lines}</CopyTextarea>;
}