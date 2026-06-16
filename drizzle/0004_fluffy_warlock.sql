-- Migrate old status values to the new enum
UPDATE "events" SET "status" = 'announced' WHERE "status" IN ('draft', 'published');
--> statement-breakpoint
ALTER TABLE "events" DROP COLUMN IF EXISTS "published_at";
--> statement-breakpoint
-- Drop default so the type dependency is removed
ALTER TABLE "events" ALTER COLUMN "status" DROP DEFAULT;
--> statement-breakpoint
ALTER TABLE "public"."events" ALTER COLUMN "status" SET DATA TYPE text;
--> statement-breakpoint
DROP TYPE IF EXISTS "public"."event_status";
--> statement-breakpoint
CREATE TYPE "public"."event_status" AS ENUM('announced', 'cancelled', 'postponed');
--> statement-breakpoint
ALTER TABLE "public"."events" ALTER COLUMN "status" SET DATA TYPE "public"."event_status" USING "status"::"public"."event_status";
--> statement-breakpoint
ALTER TABLE "events" ALTER COLUMN "status" SET DEFAULT 'announced';
