import { listEventsForExport } from "@/db/queries/events";
import { getArtistFlag } from "@/lib/formatting/country-flag";
import { CopyTextarea } from "@/components/shared/CopyTextarea";

export const dynamic = "force-dynamic";

function formatExportLine(
  event: {
    title: string;
    startsAt: Date;
    sourceUrl: string | null;
    ticketUrl: string | null;
    venue: { name: string; city: string } | null;
    eventArtists: {
      artist: {
        name: string;
        country: string;
        genre: string;
      };
    }[];
  }
): string {
  const day = String(event.startsAt.getDate()).padStart(2, "0");
  const month = String(event.startsAt.getMonth() + 1).padStart(2, "0");

  const artistParts = event.eventArtists.map((ea) => {
    const flag = getArtistFlag(ea.artist);
    const flagPart = flag ? `${flag} ` : "";
    const genrePart = ea.artist.genre ? ` (${ea.artist.genre})` : "";
    return `${flagPart}${ea.artist.name}${genrePart}`;
  });

  const prefix = artistParts.length > 0 ? artistParts.join(", ") : event.title;
  const city = event.venue?.city ?? "";
  const venue = event.venue?.name ?? "";
  const url = event.ticketUrl || event.sourceUrl || "";

  const parts = [`${day}.${month} - ${prefix}`];
  if (city) parts.push(city);
  if (venue) parts.push(venue);
  if (url) parts.push(url);

  return parts.join(", ");
}

export default async function AdminPage() {
  const events = await listEventsForExport();

  const lines = events.map(formatExportLine);
  const text = lines.join("\n");

  return (
    <section>
      <p className="mt-2 text-sm text-neutral-700">
        Events from the current and next month. Click to select all, then copy.
      </p>
      <CopyTextarea value={text} />
    </section>
  );
}