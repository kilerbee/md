ALTER TABLE "events" ADD COLUMN "facebook_url" text;
--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "featured" boolean DEFAULT false NOT NULL;
--> statement-breakpoint
UPDATE "events" SET "facebook_url" = "source_url", "source_url" = NULL WHERE "source_url" ILIKE '%facebook%';