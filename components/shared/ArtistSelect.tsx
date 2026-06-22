"use client";

import { useState, useCallback } from "react";
import { quickCreateArtist } from "@/app/admin/artists/quick-create";

export interface ArtistItem {
  id: number;
  name: string;
  country: string;
  genre: string;
}

interface ArtistSelectProps {
  artists: ArtistItem[];
  selectedArtistIds?: Set<number>;
}

export function ArtistSelect({ artists: initialArtists, selectedArtistIds }: ArtistSelectProps) {
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<number>>(selectedArtistIds ?? new Set());
  const [localArtists, setLocalArtists] = useState<ArtistItem[]>(initialArtists);
  const [showCreate, setShowCreate] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createCountry, setCreateCountry] = useState("");
  const [createGenre, setCreateGenre] = useState("");
  const [creating, setCreating] = useState(false);

  const filtered = search.trim()
    ? localArtists.filter((a) => a.name.toLowerCase().includes(search.toLowerCase()))
    : localArtists;

  const noMatch = search.trim() && filtered.length === 0;

  const toggleArtist = useCallback((id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const removeArtist = useCallback((id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const selectedArtists = localArtists.filter((a) => selectedIds.has(a.id));

  const handleCreate = useCallback(async () => {
    if (!createName.trim()) return;
    setCreating(true);
    try {
      const artist = await quickCreateArtist(
        createName.trim(),
        createCountry.trim() || "Unknown",
        createGenre.trim() || "Unknown"
      );
      if (artist) {
        // Replace local artist list with fresh data from server
        setLocalArtists(artist.allArtists);
        setSelectedIds((prev) => {
          const next = new Set(prev);
          next.add(artist.artist.id);
          return next;
        });
        // Clear search so the new artist is visible in the list
        setSearch("");
      }
      setCreateName("");
      setCreateCountry("");
      setCreateGenre("");
      setShowCreate(false);
    } finally {
      setCreating(false);
    }
  }, [createName, createCountry, createGenre]);

  return (
    <div className="space-y-2">
      <span className="text-sm font-medium">Artists</span>

      {/* Selected artists as removable tags */}
      {selectedArtists.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selectedArtists.map((artist) => (
            <span
              key={artist.id}
              className="inline-flex items-center gap-1 rounded bg-neutral-100 px-2 py-0.5 text-sm"
            >
              <span>{artist.name}</span>
              <button
                type="button"
                onClick={() => removeArtist(artist.id)}
                className="ml-0.5 text-neutral-500 hover:text-neutral-800"
                aria-label={`Remove ${artist.name}`}
              >
                &times;
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Search input */}
      <input
        className="w-full border border-neutral-300 px-3 py-2 text-sm"
        type="text"
        placeholder="Search artists..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Filtered list */}
      <div className="max-h-48 overflow-y-auto border border-neutral-300">
        {filtered.map((artist) => (
          <label
            key={artist.id}
            className="flex cursor-pointer items-center gap-2 px-3 py-1.5 text-sm hover:bg-neutral-50"
          >
            <input
              type="checkbox"
              checked={selectedIds.has(artist.id)}
              onChange={() => toggleArtist(artist.id)}
              className="accent-neutral-800"
            />
            <span>{artist.name}</span>
            {artist.country !== "Unknown" && artist.country !== "" && (
              <span className="text-xs text-neutral-500">({artist.country})</span>
            )}
          </label>
        ))}
        {filtered.length === 0 && !noMatch && (
          <p className="px-3 py-2 text-sm text-neutral-500">No artists loaded</p>
        )}
      </div>

      {/* No match: quick create button */}
      {noMatch && !showCreate && (
        <button
          type="button"
          onClick={() => {
            setCreateName(search);
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
            setShowCreate(true);
          }}
          className="block text-sm text-neutral-600 underline hover:text-neutral-900"
        >
          + Add new artist
        </button>
      )}

      {/* Inline creation form */}
      {showCreate && (
        <div className="space-y-2 rounded border border-neutral-300 bg-neutral-50 p-3">
          <p className="text-sm font-medium">New artist</p>
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
            placeholder="Country"
            value={createCountry}
            onChange={(e) => setCreateCountry(e.target.value)}
          />
          <input
            className="w-full border border-neutral-300 px-3 py-2 text-sm"
            type="text"
            placeholder="Genre"
            value={createGenre}
            onChange={(e) => setCreateGenre(e.target.value)}
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleCreate}
              disabled={creating || !createName.trim()}
              className="rounded bg-neutral-800 px-3 py-1.5 text-sm text-white disabled:opacity-50"
            >
              {creating ? "Creating..." : "Create"}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowCreate(false);
                setCreateName("");
                setCreateCountry("");
                setCreateGenre("");
              }}
              className="rounded border border-neutral-300 px-3 py-1.5 text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Hidden inputs for form submission */}
      {selectedArtists.map((artist) => (
        <input key={artist.id} type="hidden" name="artist_ids" value={artist.id} />
      ))}
    </div>
  );
}