-- CreateTable (IF NOT EXISTS so shadow DB can apply migrations in any order)
CREATE TABLE IF NOT EXISTS "public"."academy_purchases" (
    "id" TEXT NOT NULL,
    "auth_user_id" TEXT NOT NULL,
    "product_slug" TEXT NOT NULL,
    "stripe_session_id" TEXT,
    "purchased_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "academy_purchases_pkey" PRIMARY KEY ("id")
);

-- CreateIndex (ignore if exists)
CREATE UNIQUE INDEX IF NOT EXISTS "academy_purchases_stripe_session_id_key" ON "public"."academy_purchases"("stripe_session_id");
CREATE INDEX IF NOT EXISTS "academy_purchases_auth_user_id_idx" ON "public"."academy_purchases"("auth_user_id");
CREATE INDEX IF NOT EXISTS "academy_purchases_product_slug_idx" ON "public"."academy_purchases"("product_slug");
