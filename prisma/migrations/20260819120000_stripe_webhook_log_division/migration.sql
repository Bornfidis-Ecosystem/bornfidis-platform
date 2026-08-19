-- Record which Stripe platform account handled the event (provisions | digital-studio).
ALTER TABLE "public"."stripe_webhook_log"
  ADD COLUMN IF NOT EXISTS "division" TEXT;

CREATE INDEX IF NOT EXISTS "stripe_webhook_log_division_idx"
  ON "public"."stripe_webhook_log"("division");
