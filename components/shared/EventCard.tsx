import { track } from "@vercel/analytics";
import { formatEventDate } from "@/lib/formatting/date";
import { generateGoogleCalendarUrl, generateIcsUrl } from "@/lib/formatting/calendar";
import { ArtistLabel } from "./ArtistLabel";
import { EVENT_TYPE_FEST } from "@/lib/constants";

interface EventWithRelations {
  id: number;
  title: string;
  eventType: string;
  status: string;
  startsAt: Date;
  endsAt: Date | null;
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

export function EventCard({ event, hideCalendar }: { event: EventWithRelations; hideCalendar?: boolean }) {
  const isCancelled = event.status === "cancelled";
  const isPostponed = event.status === "postponed";
  const isDimmed = isCancelled || isPostponed;
  const icsUrl = !isCancelled && !hideCalendar ? generateIcsUrl(event) : null;
  const googleUrl = !isCancelled && !hideCalendar ? generateGoogleCalendarUrl(event) : null;

  return (
    <article className={`border-t border-neutral-200 pt-3 ${isDimmed ? "opacity-60" : ""}`}>
      <time className="text-xs text-neutral-500" dateTime={event.startsAt.toISOString()}>
        {formatEventDate(event.startsAt)}{event.endsAt && ` — ${formatEventDate(event.endsAt)}`}
      </time>

      {event.eventType === EVENT_TYPE_FEST ? (
        <>
          <h2 className={`mt-0.5 text-base font-medium ${isDimmed ? "line-through" : ""}`}>{event.title}</h2>
          {event.eventArtists.length > 0 && (
            <p className={`mt-0.5 text-xs text-neutral-500 ${isDimmed ? "line-through" : ""}`}>
              {event.eventArtists.map((ea, i) => (
                <span key={ea.artistId}>
                  {i > 0 && <span className="mr-1">, </span>}
                  <ArtistLabel artist={ea.artist} className="text-xs" />
                </span>
              ))}
            </p>
          )}
        </>
      ) : (
        <>
          {event.eventArtists.length === 0 && (
            <h2 className={`mt-0.5 text-base font-medium ${isDimmed ? "line-through" : ""}`}>{event.title}</h2>
          )}
          {event.eventArtists.length > 0 ? (
            <p className={`mt-1 ${isDimmed ? "line-through" : ""}`}>
              {event.eventArtists.map((ea, i) => (
                <span key={ea.artistId}>
                  {i > 0 && <span className="mx-1.5 text-neutral-300">—</span>}
                  <ArtistLabel artist={ea.artist} />
                </span>
              ))}
            </p>
          ) : null}
        </>
      )}

      <p className={`mt-0.5 text-sm text-neutral-600 ${isDimmed ? "line-through" : ""}`}>
        {[event.venue?.name, event.venue?.city].filter(Boolean).join(", ")}
      </p>

      {isCancelled ? (
        <p className="mt-1 text-xs font-medium uppercase tracking-wide text-red-600">Cancelled</p>
      ) : isPostponed ? (
        <p className="mt-1 text-xs font-medium uppercase tracking-wide text-amber-600">Postponed</p>
      ) : null}

      {event.notes && (
        <div className="mt-2 px-2 py-1 text-sm italic text-neutral-600">
          {event.notes}
        </div>
      )}

      {event.sourceUrl || event.ticketUrl || icsUrl ? (
        <div className="mt-2 flex flex-wrap items-start justify-between gap-2">
          <div className="flex flex-wrap gap-2">
            {event.sourceUrl ? (
              <a
                className="inline-block border border-neutral-400 px-2 py-1 text-xs font-medium text-neutral-600 no-underline hover:border-neutral-900 hover:text-neutral-900"
                href={event.sourceUrl}
                rel="noopener noreferrer"
                target="_blank"
                onClick={() => track("event_action", { action: "info" })}
              >
                Info
              </a>
            ) : null}
            {event.ticketUrl ? (
              <a
                className="inline-block border border-neutral-900 bg-neutral-900 px-2 py-1 text-xs font-medium text-white no-underline hover:bg-neutral-800"
                href={event.ticketUrl}
                rel="noopener noreferrer"
                target="_blank"
                onClick={() => track("event_action", { action: "ticket" })}
              >
                Tickets
              </a>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2">
            {googleUrl ? (
              <a
                className="inline-block border border-neutral-400 px-2 py-1 text-xs font-medium text-neutral-600 no-underline hover:border-neutral-900 hover:text-neutral-900"
                href={googleUrl}
                rel="noopener noreferrer"
                target="_blank"
                onClick={() => track("event_action", { action: "google_calendar" })}
              >
                Google Calendar
              </a>
            ) : null}
            {icsUrl ? (
              <a
                className="inline-block border border-neutral-400 px-2 py-1 text-xs font-medium text-neutral-600 no-underline hover:border-neutral-900 hover:text-neutral-900"
                href={icsUrl}
                download="event.ics"
                onClick={() => track("event_action", { action: "ics" })}
              >
                .ics
              </a>
            ) : null}
          </div>
        </div>
      ) : null}
    </article>
  );
}