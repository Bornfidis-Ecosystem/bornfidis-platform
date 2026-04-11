-- Balance reminder cron throttle (do not spam clients)
ALTER TABLE "public"."booking_inquiries"
ADD COLUMN IF NOT EXISTS "last_balance_reminder_sent_at" TIMESTAMP(3);
