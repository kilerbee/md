import { getArtistFlag } from "@/lib/formatting/country-flag";

export function ArtistLabel({ artist, className }: { artist: { name: string; country: string; genre: string }; className?: string }) {
  const flag = getArtistFlag(artist);

  return (
    <span className={`whitespace-nowrap text-base font-medium text-neutral-900${className ? ` ${className}` : ""}`}>
      {flag ? `${flag} ` : ""}{artist.name}
      {artist.genre ? <span className="ml-1 text-xs text-neutral-500">({artist.genre})</span> : null}
    </span>
  );
}