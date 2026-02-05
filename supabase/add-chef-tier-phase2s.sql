-- Phase 2S — Tiered Chef Rates
-- Run manually if Prisma migrate reports drift.
-- Creates: chef_profiles; adds tier snapshot + multiplier to booking_inquiries.

-- Chef tier enum (use TEXT + CHECK to match Prisma enum usage)
DO $$ BEGIN
  CREATE TYPE "ChefTier" AS ENUM ('STANDARD', 'PRO', 'ELITE');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Chef profile: tier + admin override (userId = users.id, TEXT to match Prisma)
CREATE TABLE IF NOT EXISTS public.chef_profiles (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  tier "ChefTier" NOT NULL DEFAULT 'STANDARD',
  tier_override "ChefTier" NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_chef_profiles_user_id ON public.chef_profiles(user_id);
COMMENT ON TABLE public.chef_profiles IS 'Phase 2S: Chef tier (Standard/Pro/Elite) + admin override';

-- Lock tier at job assignment (no retroactive change after payout)
ALTER TABLE public.booking_inquiries
  ADD COLUMN IF NOT EXISTS chef_tier_snapshot TEXT NULL,
  ADD COLUMN IF NOT EXISTS chef_rate_multiplier NUMERIC(4,2) NULL;

COMMENT ON COLUMN public.booking_inquiries.chef_tier_snapshot IS 'Phase 2S: STANDARD|PRO|ELITE at assignment time';
COMMENT ON COLUMN public.booking_inquiries.chef_rate_multiplier IS 'Phase 2S: 1.00|1.10|1.20 at assignment time';
