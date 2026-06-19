"use client";

import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import { useState } from "react";

const localizer = momentLocalizer(moment);

interface CalendarEvent {
  id: number;
  title: string;
  startsAt: string;
  endsAt: string | null;
  eventArtists: {
    artist: {
      name: string;
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

export function CalendarViewInner({ events }: { events: CalendarEvent[] }) {
  const calendarEvents = events.map((event) => {
    const artistNames = event.eventArtists.map((ea) => ea.artist.name).join(" — ");
    const title = artistNames || event.title;

    const start = toLocalMidnightDate(event.startsAt);
    const end = event.endsAt
      ? toLocalMidnightDayAfter(event.endsAt)
      : toLocalMidnightDayAfter(event.startsAt);

    return { title, start, end, allDay: true };
  });

  const [date, setDate] = useState(new Date());

  return (
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
      />
    </div>
  );
}