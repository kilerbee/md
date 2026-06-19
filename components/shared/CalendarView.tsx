"use client";

import dynamic from "next/dynamic";

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

const CalendarViewInner = dynamic(
  () => import("./CalendarViewInner").then((mod) => mod.CalendarViewInner),
  { ssr: false }
);

export function CalendarView({ events }: { events: CalendarEvent[] }) {
  return <CalendarViewInner events={events} />;
}