"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { formatEventDate } from "@/lib/formatting/date";
import { DeleteButton } from "@/components/shared/DeleteButton";
import { deleteEvent } from "./actions";

interface EventRow {
  id: number;
  title: string;
  startsAt: string;
  status: string;
  venue: { name: string; city: string } | null;
  eventArtists: { artist: { name: string } }[];
}

interface Props {
  events: EventRow[];
  allArtists: string[];
  allVenues: string[];
}

function MultiSelect({
  label,
  options,
  selected,
  onChange,
}: {
  label: string;
  options: string[];
  selected: string[];
  onChange: (next: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [buttonRect, setButtonRect] = useState<DOMRect | null>(null);

  const toggle = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  const openDropdown = () => {
    if (buttonRef.current) {
      setButtonRect(buttonRef.current.getBoundingClientRect());
    }
    setOpen(true);
  };

  const closeDropdown = useCallback(() => {
    setOpen(false);
    setButtonRect(null);
  }, []);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node) &&
        // If the click is inside the portal dropdown, don't close
        !(e.target as HTMLElement)?.closest?.("[data-multiselect-portal]")
      ) {
        closeDropdown();
      }
    };
    // Delay adding listener to avoid the same click that opened it from closing it
    const timer = setTimeout(() => {
      document.addEventListener("mousedown", handler);
    }, 0);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", handler);
    };
  }, [open, closeDropdown]);

  // Close on resize (reposition needed)
  useEffect(() => {
    if (!open) return;
    const handler = () => closeDropdown();
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, [open, closeDropdown]);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        className="flex w-full items-center gap-1 py-2 pr-4 text-left font-medium"
        onClick={openDropdown}
      >
        <span className="truncate">
          {selected.length === 0
            ? label
            : `${label} (${selected.length})`}
        </span>
        <svg
          className={`ml-auto h-3 w-3 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
          viewBox="0 0 10 6"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M1 1l4 4 4-4" />
        </svg>
      </button>

      {open &&
        buttonRect &&
        createPortal(
          <div
            data-multiselect-portal
            className="z-50 max-h-60 overflow-y-auto border border-neutral-200 bg-white shadow-lg"
            style={{
              position: "fixed",
              left: buttonRect.left,
              top: buttonRect.bottom + 4,
              minWidth: Math.max(buttonRect.width, 200),
            }}
          >
            <div className="sticky top-0 flex gap-2 border-b border-neutral-100 bg-white px-3 py-1.5">
              <button
                type="button"
                className="text-xs text-neutral-500 hover:text-black"
                onClick={() => onChange([])}
              >
                Clear
              </button>
              <button
                type="button"
                className="text-xs text-neutral-500 hover:text-black"
                onClick={() => onChange([...options])}
              >
                All
              </button>
            </div>
            {options.map((opt) => (
              <label
                key={opt}
                className="flex cursor-pointer items-center gap-2 px-3 py-1.5 text-sm hover:bg-neutral-50"
              >
                <input
                  type="checkbox"
                  className="accent-black"
                  checked={selected.includes(opt)}
                  onChange={() => toggle(opt)}
                />
                {opt}
              </label>
            ))}
            {options.length === 0 && (
              <p className="px-3 py-2 text-sm text-neutral-400">No options</p>
            )}
          </div>,
          document.body
        )}
    </>
  );
}

export function AdminEventTable({ events, allArtists, allVenues }: Props) {
  const [selectedArtists, setSelectedArtists] = useState<string[]>([]);
  const [selectedVenues, setSelectedVenues] = useState<string[]>([]);

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      if (selectedArtists.length > 0) {
        const hasArtist = event.eventArtists.some((ea) =>
          selectedArtists.includes(ea.artist.name)
        );
        if (!hasArtist) return false;
      }
      if (selectedVenues.length > 0) {
        const venueLabel = event.venue
          ? `${event.venue.name}, ${event.venue.city}`
          : "No venue";
        if (!selectedVenues.includes(venueLabel)) return false;
      }
      return true;
    });
  }, [events, selectedArtists, selectedVenues]);

  return (
    <div className="mt-6 min-h-0 flex-1 overflow-auto">
      <table className="w-full border-collapse text-left text-sm">
        <thead className="sticky top-0 z-10 bg-neutral-50">
          <tr className="border-b border-neutral-200">
            <th className="py-2 pr-4 font-medium">Title</th>
            <th className="py-2 pr-4 font-medium">Date</th>
            <th className="py-2 pr-4 font-medium">
              <MultiSelect
                label="Venue"
                options={allVenues}
                selected={selectedVenues}
                onChange={setSelectedVenues}
              />
            </th>
            <th className="py-2 pr-4 font-medium">
              <MultiSelect
                label="Artists"
                options={allArtists}
                selected={selectedArtists}
                onChange={setSelectedArtists}
              />
            </th>
            <th className="py-2 pr-4 font-medium">Status</th>
            <th className="py-2 pr-4 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredEvents.map((event) => (
            <tr key={event.id} className="border-b border-neutral-100 align-top even:bg-neutral-100">
              <td className="py-3 pr-4">{event.title}</td>
              <td className="py-3 pr-4">{formatEventDate(new Date(event.startsAt))}</td>
              <td className="py-3 pr-4">
                {event.venue
                  ? `${event.venue.name}, ${event.venue.city}`
                  : "No venue"}
              </td>
              <td className="py-3 pr-4">
                {event.eventArtists
                  .map((item) => item.artist.name)
                  .join(", ") || "No artists"}
              </td>
              <td className="py-3 pr-4 capitalize">{event.status}</td>
              <td className="flex gap-3 py-3 pr-4">
                <Link href={`/admin/events/${event.id}/edit`}>Edit</Link>
                <DeleteButton action={deleteEvent} id={event.id} label="Delete this event?" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {filteredEvents.length === 0 && (
        <p className="mt-4 text-neutral-500">No events match the selected filters.</p>
      )}
    </div>
  );
}