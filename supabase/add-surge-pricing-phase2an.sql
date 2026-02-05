-- Phase 2AN — Demand-based surge pricing (admin-tunable; no retroactive)
CREATE TABLE IF NOT EXISTS public.surge_config (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  region_code TEXT NOT NULL UNIQUE,
  enabled BOOLEAN NOT NULL DEFAULT true,
  demand_bookings_threshold INTEGER NOT NULL DEFAULT 5,
  supply_chefs_threshold INTEGER NOT NULL DEFAULT 2,
  short_notice_hours INTEGER NOT NULL DEFAULT 48,
  surge_multiplier DOUBLE PRECISION NOT NULL DEFAULT 1.15,
  min_multiplier DOUBLE PRECISION NOT NULL DEFAULT 1.05,
  max_multiplier DOUBLE PRECISION NOT NULL DEFAULT 1.30,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.surge_config IS 'Phase 2AN: Surge applies when demand/supply/short-notice thresholds met; multiplier capped.';

ALTER TABLE public.booking_inquiries
  ADD COLUMN IF NOT EXISTS surge_multiplier_snapshot DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS surge_applied_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS surge_label TEXT;

COMMENT ON COLUMN public.booking_inquiries.surge_label IS 'Phase 2AN: e.g. "High-Demand Pricing" for client visibility.';
