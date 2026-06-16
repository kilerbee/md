export const allowedEventTypes = ["concert", "festival", "conference", "lecture", "party", "other"] as const;
export const allowedImportStatuses = ["announced", "cancelled", "postponed"] as const;

export type ImportEventType = (typeof allowedEventTypes)[number];
export type ImportStatus = (typeof allowedImportStatuses)[number];

export type ImportArtist = {
  name: string;
  country: string;
  genre: string;
  slug: string;
};

export type ImportVenue = {
  name: string;
  city: string;
  slug: string;
};

export type ImportEvent = {
  externalId: string;
  title: string;
  slug: string;
  eventType: ImportEventType;
  status: ImportStatus;
  startDate: string;
  endDate: string | null;
  venueKey: string;
  artistKeys: string[];
  ticketUrl: string | null;
  sourceUrl: string | null;
  notes: string | null;
  sourceText: string | null;
};

export type ImportPlan = {
  version: 1;
  generatedAt: string;
  artistsToCreate: ImportArtist[];
  artistsExisting: ImportArtist[];
  venuesToCreate: ImportVenue[];
  venuesExisting: ImportVenue[];
  eventsToCreate: ImportEvent[];
  eventsExisting: ImportEvent[];
  warnings: string[];
  errors: string[];
};

export type ImportState = {
  input: string;
  plan: ImportPlan | null;
  signedPlan: string | null;
  importMessage: string | null;
};
