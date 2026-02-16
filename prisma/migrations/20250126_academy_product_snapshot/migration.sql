-- Add product snapshot columns (TASK 2)
ALTER TABLE "public"."academy_purchases" ADD COLUMN "product_title" TEXT NOT NULL DEFAULT '';
ALTER TABLE "public"."academy_purchases" ADD COLUMN "product_price" INTEGER NOT NULL DEFAULT 0;

-- Backfill existing rows: set stripe_session_id from id where null, then enforce NOT NULL
UPDATE "public"."academy_purchases" SET "stripe_session_id" = "id" WHERE "stripe_session_id" IS NULL;
ALTER TABLE "public"."academy_purchases" ALTER COLUMN "stripe_session_id" SET NOT NULL;
