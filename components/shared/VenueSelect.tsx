"use client";

import { useState, useCallback } from "react";
import { quickCreateVenue } from "@/app/admin/venues/quick-create";

export interface VenueItem {
  id: number;
  name: string;
  city: string;
  locationUrl: string | null;
}

interface VenueSelectProps {
  venues: VenueItem[];
  selectedVenueId?: number | null;
}

export function VenueSelect({ venues: initialVenues, selectedVenueId }: VenueSelectProps) {
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(selectedVenueId ?? null);
  const [localVenues, setLocalVenues] = useState<VenueItem[]>(initialVenues);
  const [showCreate, setShowCreate] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createCity, setCreateCity] = useState("");
  const [createLocationUrl, setCreateLocationUrl] = useState("");
  const [creating, setCreating] = useState(false);

  const filtered = search.trim()
    ? localVenues.filter(
        (v) =>
          v.name.toLowerCase().includes(search.toLowerCase()) ||
          v.city.toLowerCase().includes(search.toLowerCase())
      )
    : localVenues;

  const noMatch = search.trim() && filtered.length === 0;

  const selectedVenue = localVenues.find((v) => v.id === selectedId) ?? null;

  const handleSelect = useCallback((id: number | null) => {
    setSelectedId(id);
  }, []);

  const handleCreate = useCallback(async () => {
    if (!createName.trim() || !createCity.trim()) return;
    setCreating(true);
    try {
      const result = await quickCreateVenue(createName.trim(), createCity.trim(), createLocationUrl.trim() || undefined);
      if (result) {
        setLocalVenues(result.allVenues);
        setSelectedId(result.venue.id);
        setSearch("");
      }
      setCreateName("");
      setCreateCity("");
      setCreateLocationUrl("");
      setShowCreate(false);
    } finally {
      setCreating(false);
    }
  }, [createName, createCity, createLocationUrl]);

  return (
    <div className="space-y-2">
      <span className="text-sm font-medium">Venue</span>

      {/* Selected venue tag */}
      {selectedVenue && (
        <div className="flex flex-wrap gap-1.5">
          <span className="inline-flex items-center gap-1 rounded bg-neutral-100 px-2 py-0.5 text-sm">
            <span>
              {selectedVenue.name}, {selectedVenue.city}
            </span>
            <button
              type="button"
              onClick={() => handleSelect(null)}
              className="ml-0.5 text-neutral-500 hover:text-neutral-800"
              aria-label={`Remove ${selectedVenue.name}`}
            >
              &times;
            </button>
          </span>
        </div>
      )}

      {/* Search input */}
      <input
        className="w-full border border-neutral-300 px-3 py-2 text-sm"
        type="text"
        placeholder="Search venues..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Filtered list */}
      <div className="max-h-48 overflow-y-auto border border-neutral-300">
        {filtered.map((venue) => (
          <label
            key={venue.id}
            className="flex cursor-pointer items-center gap-2 px-3 py-1.5 text-sm hover:bg-neutral-50"
          >
            <input
              type="radio"
              name="venue_radio"
              checked={selectedId === venue.id}
              onChange={() => handleSelect(venue.id)}
              className="accent-neutral-800"
            />
            <span>
              {venue.name}, {venue.city}
            </span>
          </label>
        ))}
        {filtered.length === 0 && !noMatch && (
          <p className="px-3 py-2 text-sm text-neutral-500">No venues loaded</p>
        )}
      </div>

      {/* No match: quick create button */}
      {noMatch && !showCreate && (
        <button
          type="button"
          onClick={() => {
            // Try to extract city from search: if there's a comma, use the second part as city
            const commaIdx = search.indexOf(",");
            if (commaIdx !== -1) {
              setCreateName(search.slice(0, commaIdx).trim());
              setCreateCity(search.slice(commaIdx + 1).trim());
            } else {
              setCreateName(search);
              setCreateCity("");
            }
            setShowCreate(true);
          }}
          className="text-sm text-neutral-600 underline hover:text-neutral-900"
        >
          + Create &ldquo;{search}&rdquo;
        </button>
      )}

      {/* Always-visible create button */}
      {!showCreate && (
        <button
          type="button"
          onClick={() => {
            setCreateName("");
            setCreateCity("");
            setShowCreate(true);
          }}
          className="block text-sm text-neutral-600 underline hover:text-neutral-900"
        >
          + Add new venue
        </button>
      )}

      {/* Inline creation form */}
      {showCreate && (
        <div className="space-y-2 rounded border border-neutral-300 bg-neutral-50 p-3">
          <p className="text-sm font-medium">New venue</p>
          <input
            className="w-full border border-neutral-300 px-3 py-2 text-sm"
            type="text"
            placeholder="Name *"
            value={createName}
            onChange={(e) => setCreateName(e.target.value)}
            required
          />
          <input
            className="w-full border border-neutral-300 px-3 py-2 text-sm"
            type="text"
            placeholder="City *"
            value={createCity}
            onChange={(e) => setCreateCity(e.target.value)}
            required
          />
          <input
            className="w-full border border-neutral-300 px-3 py-2 text-sm"
            type="url"
            placeholder="Map URL"
            value={createLocationUrl}
            onChange={(e) => setCreateLocationUrl(e.target.value)}
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleCreate}
              disabled={creating || !createName.trim() || !createCity.trim()}
              className="rounded bg-neutral-800 px-3 py-1.5 text-sm text-white disabled:opacity-50"
            >
              {creating ? "Creating..." : "Create"}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowCreate(false);
                setCreateName("");
                setCreateCity("");
              }}
              className="rounded border border-neutral-300 px-3 py-1.5 text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Hidden input for form submission */}
      <input type="hidden" name="venue_id" value={selectedId ?? ""} />
    </div>
  );
}