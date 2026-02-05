-- Phase 2AI — Multi-currency support
-- Base currency USD; rates for display + payout lock. Run after Prisma migrate or apply manually.

-- Currency rates (one row per from/to pair)
CREATE TABLE IF NOT EXISTS public.currency_rates (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  from_code TEXT NOT NULL,
  to_code TEXT NOT NULL,
  rate DOUBLE PRECISION NOT NULL,
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(from_code, to_code)
);

CREATE INDEX IF NOT EXISTS idx_currency_rates_from_to ON public.currency_rates(from_code, to_code);

-- Chef profiles: preferred and admin override (if table exists and columns missing)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'chef_profiles') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'chef_profiles' AND column_name = 'preferred_payout_currency') THEN
      ALTER TABLE public.chef_profiles ADD COLUMN preferred_payout_currency TEXT DEFAULT 'USD';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'chef_profiles' AND column_name = 'payout_currency_override') THEN
      ALTER TABLE public.chef_profiles ADD COLUMN payout_currency_override TEXT;
    END IF;
  END IF;
END $$;

-- Booking inquiries: locked FX at payout (if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'booking_inquiries') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'booking_inquiries' AND column_name = 'chef_payout_currency') THEN
      ALTER TABLE public.booking_inquiries ADD COLUMN chef_payout_currency TEXT DEFAULT 'USD';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'booking_inquiries' AND column_name = 'chef_payout_fx_rate') THEN
      ALTER TABLE public.booking_inquiries ADD COLUMN chef_payout_fx_rate DOUBLE PRECISION;
    END IF;
  END IF;
END $$;
