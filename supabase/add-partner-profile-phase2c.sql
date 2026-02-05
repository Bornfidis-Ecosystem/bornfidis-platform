-- Phase 2C — Partner Profile Setup Wizard
-- Run if not using Prisma migrate. Creates PartnerType enum and partner_profiles table.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'PartnerType') THEN
    CREATE TYPE "PartnerType" AS ENUM ('FARMER', 'CHEF', 'COOPERATIVE', 'OTHER');
  END IF;
END
$$;

CREATE TABLE IF NOT EXISTS public.partner_profiles (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  partner_type "PartnerType" NOT NULL,
  parish TEXT,
  phone TEXT,
  bio TEXT,
  completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_partner_profiles_user_id ON public.partner_profiles (user_id);

COMMENT ON TABLE public.partner_profiles IS 'Phase 2C: Partner profile setup wizard. completed = true after first-time setup.';
