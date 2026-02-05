-- Phase 2AL — Region-based pricing rules (city/parish, multiplier, travel fee, minimum)
-- Run after Prisma migration or apply manually if using Supabase-only migrations

CREATE TABLE IF NOT EXISTS public.region_pricing (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  region_code TEXT NOT NULL UNIQUE,
  name TEXT,
  zone TEXT,
  multiplier DOUBLE PRECISION NOT NULL DEFAULT 1.0,
  travel_fee_cents INTEGER NOT NULL DEFAULT 0,
  minimum_cents INTEGER NOT NULL DEFAULT 0,
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_region_pricing_region_code ON public.region_pricing(region_code);
CREATE INDEX IF NOT EXISTS idx_region_pricing_enabled ON public.region_pricing(enabled);

COMMENT ON TABLE public.region_pricing IS 'Phase 2AL: Region-based pricing (multiplier, travel fee, minimum).';

-- Add region snapshot columns to booking_inquiries (locked at quote time)
ALTER TABLE public.booking_inquiries
  ADD COLUMN IF NOT EXISTS region_code TEXT,
  ADD COLUMN IF NOT EXISTS region_multiplier_snapshot DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS region_travel_fee_cents_snapshot INTEGER,
  ADD COLUMN IF NOT EXISTS region_minimum_cents_snapshot INTEGER;

COMMENT ON COLUMN public.booking_inquiries.region_code IS 'Phase 2AL: Region locked at quote/booking time.';
