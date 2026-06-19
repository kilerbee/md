"use client";

import { CalendarViewInner } from "./CalendarViewInner";

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

export function CalendarView({ events }: { events: CalendarEvent[] }) {
  return <CalendarViewInner events={events} />;
}