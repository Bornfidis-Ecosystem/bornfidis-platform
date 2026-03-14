-- Idempotent: ensure table exists with full schema (for shadow DB when this runs before academy_purchases)
CREATE TABLE IF NOT EXISTS "public"."academy_purchases" (
    "id" TEXT NOT NULL,
    "auth_user_id" TEXT NOT NULL,
    "product_slug" TEXT NOT NULL,
    "product_title" TEXT NOT NULL DEFAULT '',
    "product_price" INTEGER NOT NULL DEFAULT 0,
    "stripe_session_id" TEXT,
    "purchased_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "academy_purchases_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "academy_purchases_stripe_session_id_key" ON "public"."academy_purchases"("stripe_session_id");
CREATE INDEX IF NOT EXISTS "academy_purchases_auth_user_id_idx" ON "public"."academy_purchases"("auth_user_id");
CREATE INDEX IF NOT EXISTS "academy_purchases_product_slug_idx" ON "public"."academy_purchases"("product_slug");

-- Add columns if table was created by 20250126_academy_purchases (without them)
ALTER TABLE "public"."academy_purchases" ADD COLUMN IF NOT EXISTS "product_title" TEXT NOT NULL DEFAULT '';
ALTER TABLE "public"."academy_purchases" ADD COLUMN IF NOT EXISTS "product_price" INTEGER NOT NULL DEFAULT 0;

-- Backfill existing rows and enforce NOT NULL on stripe_session_id
UPDATE "public"."academy_purchases" SET "stripe_session_id" = "id" WHERE "stripe_session_id" IS NULL;
ALTER TABLE "public"."academy_purchases" ALTER COLUMN "stripe_session_id" SET NOT NULL;
