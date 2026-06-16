import { formatEventDate } from "@/lib/formatting/date";
import { ArtistLabel } from "./ArtistLabel";

interface EventWithRelations {
  id: number;
  title: string;
  startsAt: Date;
  venue: { name: string; city: string } | null;
  sourceUrl: string | null;
  ticketUrl: string | null;
  eventArtists: {
    artistId: number;
    artist: {
      name: string;
      country: string;
      genre: string;
    };
  }[];
}

export function EventCard({ event }: { event: EventWithRelations }) {
  return (
    <article className="border-t border-neutral-200 pt-5">
      <time className="text-sm text-neutral-600" dateTime={event.startsAt.toISOString()}>
        {formatEventDate(event.startsAt)}
      </time>

      {event.eventArtists.length === 0 && (
        <h2 className="mt-1 text-xl font-medium">{event.title}</h2>
      )}

      {event.eventArtists.length > 0 ? (
        <p className="mt-2">
          {event.eventArtists.map((ea, i) => (
            <span key={ea.artistId}>
              {i > 0 && <span className="mx-2 text-neutral-300">-</span>}
              <ArtistLabel artist={ea.artist} />
            </span>
          ))}
        </p>
      ) : null}

      <p className="mt-1 text-sm text-neutral-700">
        {[event.venue?.name, event.venue?.city].filter(Boolean).join(", ")}
      </p>

      {event.sourceUrl || event.ticketUrl ? (
        <div className="mt-3 flex gap-3">
          {event.sourceUrl ? (
            <a
              className="inline-block border border-neutral-400 px-3 py-1.5 text-xs font-medium text-neutral-700 no-underline hover:border-neutral-900 hover:text-neutral-900"
              href={event.sourceUrl}
              rel="noopener noreferrer"
              target="_blank"
            >
              Info
            </a>
          ) : null}
          {event.ticketUrl ? (
            <a
              className="inline-block border border-neutral-900 bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white no-underline hover:bg-neutral-800"
              href={event.ticketUrl}
              rel="noopener noreferrer"
              target="_blank"
            >
              Tickets
            </a>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}