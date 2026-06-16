import { formatEventDate } from "@/lib/formatting/date";
import { formatArtistWithFlag } from "@/lib/formatting/country-flag";

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

      {event.eventArtists.length > 0 && (
        <h2 className="mt-1 text-xl font-medium">
          {event.eventArtists.map((ea) => formatArtistWithFlag(ea.artist)).join(', ')}
        </h2>
      )}

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
              className="inline-block border border-green-900 bg-green-900 px-3 py-1.5 text-xs font-medium text-white no-underline hover:bg-neutral-800"
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