"use client";

import { Calendar, momentLocalizer, type EventPropGetter } from "react-big-calendar";
import moment from "moment";
import { useState } from "react";
import { EVENT_TYPE_FEST } from "@/lib/constants";
import { formatEventDate } from "@/lib/formatting/date";
import { ArtistLabel } from "./ArtistLabel";

const localizer = momentLocalizer(moment);

interface CalendarEvent {
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

function toBelgradeDateParts(isoString: string): { year: number; month: number; day: number } {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Belgrade",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  });
  const [year, month, day] = formatter.format(new Date(isoString)).split("-").map(Number);
  return { year, month, day };
}

function toLocalMidnightDate(isoString: string): Date {
  const { year, month, day } = toBelgradeDateParts(isoString);
  return new Date(year, month - 1, day);
}

function toLocalMidnightDayAfter(isoString: string): Date {
  const { year, month, day } = toBelgradeDateParts(isoString);
  return new Date(year, month - 1, day + 1);
}

function EventPopup({ event, onClose }: { event: CalendarEvent; onClose: () => void }) {
  const isCancelled = event.status === "cancelled";
  const isPostponed = event.status === "postponed";
  const isDimmed = isCancelled || isPostponed;
  const startsAt = new Date(event.startsAt);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={onClose}>
      <div
        className="mx-4 w-full max-w-lg bg-white p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <article className={`${isDimmed ? "opacity-60" : ""}`}>
          <time className="text-xs text-neutral-500" dateTime={event.startsAt}>
            {formatEventDate(startsAt)}
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

          {(event.sourceUrl || event.ticketUrl) && (
            <div className="mt-2 flex flex-wrap gap-2">
              {event.sourceUrl ? (
                <a
                  className="inline-block border border-neutral-400 px-2 py-1 text-xs font-medium text-neutral-600 no-underline hover:border-neutral-900 hover:text-neutral-900"
                  href={event.sourceUrl}
                  rel="noopener noreferrer"
                  target="_blank"
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
                >
                  Tickets
                </a>
              ) : null}
            </div>
          )}
        </article>

        <button
          className="mt-4 w-full border border-neutral-300 px-3 py-1.5 text-sm text-neutral-600 hover:border-neutral-900 hover:text-neutral-900"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
}

export function CalendarView({ events }: { events: CalendarEvent[] }) {
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  const calendarEvents = events.map((event) => {
    const artistNames = event.eventArtists.map((ea) => ea.artist.name).join(", ");
    const title = event.eventType === EVENT_TYPE_FEST ? event.title : artistNames || event.title;

    const start = toLocalMidnightDate(event.startsAt);
    const end = event.endsAt
      ? toLocalMidnightDayAfter(event.endsAt)
      : toLocalMidnightDayAfter(event.startsAt);

    return { title, start, end, allDay: true, eventType: event.eventType, resource: event };
  });

  const [date, setDate] = useState(new Date());

  const eventPropGetter: EventPropGetter<{ eventType?: string }> = (event) => {
    if (event.eventType === EVENT_TYPE_FEST) {
      return { className: "rbc-event--festival" };
    }
    return {};
  };

  return (
    <>
      <div className="h-[700px]">
        <Calendar
          localizer={localizer}
          events={calendarEvents}
          views={["month"]}
          defaultView="month"
          startAccessor="start"
          endAccessor="end"
          date={date}
          onNavigate={setDate}
          allDayAccessor={() => true}
          eventPropGetter={eventPropGetter}
          onSelectEvent={(event) => setSelectedEvent(event.resource as CalendarEvent)}
        />
      </div>

      {selectedEvent && (
        <EventPopup event={selectedEvent} onClose={() => setSelectedEvent(null)} />
      )}
    </>
  );
}