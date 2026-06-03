-- Run in Supabase SQL editor (or psql) if you are not using `prisma migrate` for this project.

ALTER TABLE public.booking_inquiries ADD COLUMN IF NOT EXISTS dining_style TEXT;
ALTER TABLE public.booking_inquiries ADD COLUMN IF NOT EXISTS upsell_interests TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
ALTER TABLE public.booking_inquiries ADD COLUMN IF NOT EXISTS inquiry_reminder_sent_at TIMESTAMPTZ;

ALTER TABLE public.booking_inquiries ALTER COLUMN status SET DEFAULT 'new_inquiry';

-- Optional: align legacy "New" rows (review before running in production).
-- UPDATE public.booking_inquiries SET status = 'new_inquiry' WHERE status = 'New';
