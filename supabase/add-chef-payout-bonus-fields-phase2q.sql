-- Phase 2Q — Performance-based payout bonus fields
-- Run manually if Prisma migrate reports drift.

ALTER TABLE public.booking_inquiries
  ADD COLUMN IF NOT EXISTS chef_payout_base_cents INTEGER,
  ADD COLUMN IF NOT EXISTS chef_payout_bonus_cents INTEGER,
  ADD COLUMN IF NOT EXISTS chef_payout_bonus_breakdown JSONB,
  ADD COLUMN IF NOT EXISTS chef_payout_bonus_override BOOLEAN DEFAULT false;

COMMENT ON COLUMN public.booking_inquiries.chef_payout_base_cents IS 'Phase 2Q: Base amount before bonus';
COMMENT ON COLUMN public.booking_inquiries.chef_payout_bonus_cents IS 'Phase 2Q: Bonus amount';
COMMENT ON COLUMN public.booking_inquiries.chef_payout_bonus_breakdown IS 'Phase 2Q: [{ badge, pct }]';
COMMENT ON COLUMN public.booking_inquiries.chef_payout_bonus_override IS 'Phase 2Q: Admin disable bonus for this job';
