"use client";

import { Calendar, momentLocalizer, type EventPropGetter } from "react-big-calendar";
import moment from "moment";
import "moment/locale/en-gb";
import { useState } from "react";
import { EVENT_TYPE_FEST } from "@/lib/constants";
import { CustomToolbar } from "./CustomToolbar";
import { EventCard } from "./EventCard";

const localizer = momentLocalizer(moment);

interface CalendarEvent {
  id: number;
  title: string;
  eventType: string;
  status: string;
  startsAt: string;
  endsAt: string | null;
  venue: { name: string; city: string; locationUrl: string | null } | null;
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
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={onClose}>
      <div
        className="mx-4 w-full max-w-lg bg-white p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <EventCard
          event={{
            ...event,
            startsAt: new Date(event.startsAt),
            endsAt: event.endsAt ? new Date(event.endsAt) : null
          }}
        />
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
          components={{ toolbar: CustomToolbar }}
          culture="en-GB"
        />
      </div>

      {selectedEvent && (
        <EventPopup event={selectedEvent} onClose={() => setSelectedEvent(null)} />
      )}
    </>
  );
}