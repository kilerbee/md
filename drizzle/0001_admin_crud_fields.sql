ALTER TABLE "artists" ADD COLUMN IF NOT EXISTS "country" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "artists" ADD COLUMN IF NOT EXISTS "genre" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN IF NOT EXISTS "event_type" text DEFAULT 'concert' NOT NULL;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN IF NOT EXISTS "notes" text;--> statement-breakpoint
ALTER TABLE "events" DROP COLUMN IF EXISTS "city";--> statement-breakpoint
ALTER TABLE "artists" DROP COLUMN IF EXISTS "website_url";--> statement-breakpoint
ALTER TABLE "venues" DROP COLUMN IF EXISTS "address";--> statement-breakpoint
ALTER TABLE "venues" DROP COLUMN IF EXISTS "website_url";--> statement-breakpoint
ALTER TABLE "venues" DROP COLUMN IF EXISTS "google_maps_url";--> statement-breakpoint
ALTER TABLE "events" DROP COLUMN IF EXISTS "description";--> statement-breakpoint
ALTER TABLE "events" DROP COLUMN IF EXISTS "event_url";--> statement-breakpoint
ALTER TABLE "event_artists" DROP COLUMN IF EXISTS "billing_label";--> statement-breakpoint
ALTER TABLE "event_artists" DROP CONSTRAINT IF EXISTS "event_artists_artist_id_artists_id_fk";--> statement-breakpoint
ALTER TABLE "event_artists" ADD CONSTRAINT "event_artists_artist_id_artists_id_fk" FOREIGN KEY ("artist_id") REFERENCES "public"."artists"("id") ON DELETE cascade ON UPDATE no action;
