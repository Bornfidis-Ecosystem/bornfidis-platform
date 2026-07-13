-- Stripe reconciliation audit log (matched + unmatched payments)
CREATE TABLE IF NOT EXISTS "stripe_webhook_log" (
  "id" TEXT NOT NULL,
  "event_type" TEXT NOT NULL,
  "stripe_event_id" TEXT,
  "stripe_object_id" TEXT NOT NULL,
  "payment_intent_id" TEXT,
  "amount_cents" INTEGER,
  "customer_email" TEXT,
  "matched_booking_id" TEXT,
  "processing_status" TEXT NOT NULL DEFAULT 'received',
  "error_message" TEXT,
  "payment_type" TEXT,
  "raw_payload" JSONB,
  "received_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "stripe_webhook_log_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "stripe_webhook_log_stripe_event_id_key" ON "stripe_webhook_log"("stripe_event_id");
CREATE INDEX IF NOT EXISTS "stripe_webhook_log_matched_booking_id_idx" ON "stripe_webhook_log"("matched_booking_id");
CREATE INDEX IF NOT EXISTS "stripe_webhook_log_processing_status_idx" ON "stripe_webhook_log"("processing_status");
CREATE INDEX IF NOT EXISTS "stripe_webhook_log_customer_email_idx" ON "stripe_webhook_log"("customer_email");
CREATE INDEX IF NOT EXISTS "stripe_webhook_log_received_at_idx" ON "stripe_webhook_log"("received_at");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'stripe_webhook_log_matched_booking_id_fkey'
  ) THEN
    ALTER TABLE "stripe_webhook_log"
      ADD CONSTRAINT "stripe_webhook_log_matched_booking_id_fkey"
      FOREIGN KEY ("matched_booking_id") REFERENCES "booking_inquiries"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
