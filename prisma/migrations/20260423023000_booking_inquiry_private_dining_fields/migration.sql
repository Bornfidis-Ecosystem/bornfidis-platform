-- Align booking_inquiries with BookingInquiry Prisma model additions.
ALTER TABLE "public"."booking_inquiries"
  ADD COLUMN IF NOT EXISTS "dining_style" TEXT,
  ADD COLUMN IF NOT EXISTS "upsell_interests" TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS "inquiry_reminder_sent_at" TIMESTAMP(3);

-- Ensure status default matches current Prisma model expectation.
ALTER TABLE "public"."booking_inquiries"
  ALTER COLUMN "status" SET DEFAULT 'new_inquiry';
