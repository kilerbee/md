import { getArtistFlag } from "@/lib/formatting/country-flag";

export function ArtistLabel({ artist }: { artist: { name: string; country: string; genre: string } }) {
  const flag = getArtistFlag(artist);

  return (
    <span className="text-base font-medium text-neutral-900">
      {flag ? `${flag} ` : ""}{artist.name}
      {artist.genre ? <span className="ml-1 text-xs text-neutral-500">({artist.genre})</span> : null}
    </span>
  );
}