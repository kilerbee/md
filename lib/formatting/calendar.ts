function formatAllDayParts(date: Date): { year: number; month: number; day: number } {
  // Extract date parts in Europe/Belgrade timezone
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Belgrade",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  });
  // en-CA format: YYYY-MM-DD
  const [year, month, day] = formatter.format(date).split("-").map(Number);
  return { year, month, day };
}

function formatAllDayIcsDate(date: Date): string {
  // All-day iCalendar format: YYYYMMDD (no time, no timezone)
  const { year, month, day } = formatAllDayParts(date);
  return `${year}${String(month).padStart(2, "0")}${String(day).padStart(2, "0")}`;
}

function formatAllDayGoogleDate(date: Date): string {
  // Google all-day format: YYYYMMDD (no time)
  const { year, month, day } = formatAllDayParts(date);
  return `${year}${String(month).padStart(2, "0")}${String(day).padStart(2, "0")}`;
}

function escapeUri(text: string): string {
  return encodeURIComponent(text);
}

function escapeIcsText(text: string): string {
  return text.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

export function generateGoogleCalendarUrl(event: {
  title: string;
  startsAt: Date;
  endsAt: Date | null;
  venue: { name: string; city: string } | null;
  ticketUrl: string | null;
  sourceUrl: string | null;
  notes: string | null;
  eventArtists: { artist: { name: string; country: string; genre: string } }[];
}): string {
  const artistNames = event.eventArtists.map((ea) => ea.artist.name).join(", ");
  const text = artistNames || event.title;

  // All-day: dates span from start day to the day after
  const dtStart = formatAllDayGoogleDate(event.startsAt);
  const endDay = new Date(event.startsAt);
  endDay.setDate(endDay.getDate() + 1);
  const dtEnd = formatAllDayGoogleDate(endDay);

  const location = [event.venue?.name, event.venue?.city].filter(Boolean).join(", ");
  const urls = [event.ticketUrl, event.sourceUrl].filter(Boolean).join(" | ");
  const details = [event.notes, urls].filter(Boolean).join("\n");

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${escapeUri(text)}&dates=${dtStart}/${dtEnd}&location=${escapeUri(location)}&details=${escapeUri(details)}`;
}

export function generateIcsUrl(event: {
  title: string;
  startsAt: Date;
  endsAt: Date | null;
  venue: { name: string; city: string } | null;
  ticketUrl: string | null;
  sourceUrl: string | null;
  notes: string | null;
  eventArtists: { artist: { name: string; country: string; genre: string } }[];
}): string {
  const now = new Date();
  const uid = `${event.startsAt.getTime()}-${event.title.replace(/\s+/g, "-")}@muzickidogadjaji`;

  const artistNames = event.eventArtists.map((ea) => ea.artist.name).join(", ");
  const summary = artistNames || event.title;

  // All-day: VALUE=DATE (no time), and end date is the day after
  const dtStart = `;VALUE=DATE:${formatAllDayIcsDate(event.startsAt)}`;
  const endDay = new Date(event.startsAt);
  endDay.setDate(endDay.getDate() + 1);
  const dtEnd = `;VALUE=DATE:${formatAllDayIcsDate(endDay)}`;
  const dtStamp = formatAllDayIcsDate(now);

  const location = [event.venue?.name, event.venue?.city].filter(Boolean).join(", ");
  const urls = [event.ticketUrl, event.sourceUrl].filter(Boolean).join(" | ");
  const descriptionParts: string[] = [];
  if (event.notes) descriptionParts.push(event.notes);
  if (urls) descriptionParts.push(urls);
  const description = escapeIcsText(descriptionParts.join("\n"));

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//MuzickiDogađaji//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP;VALUE=DATE:${dtStamp}`,
    `DTSTART${dtStart}`,
    `DTEND${dtEnd}`,
    `SUMMARY:${escapeIcsText(summary)}`,
    location ? `LOCATION:${escapeIcsText(location)}` : null,
    description ? `DESCRIPTION:${description}` : null,
    "END:VEVENT",
    "END:VCALENDAR"
  ]
    .filter(Boolean)
    .join("\r\n");

  return `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`;
}