-- Phase 2V — Chef Availability (day-based calendar)
-- Run manually if Prisma migrate reports drift.

CREATE TABLE IF NOT EXISTS public.chef_availabilities (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  chef_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  available BOOLEAN NOT NULL DEFAULT true,
  note TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(chef_id, date)
);

CREATE INDEX IF NOT EXISTS idx_chef_availabilities_chef_id ON public.chef_availabilities(chef_id);
CREATE INDEX IF NOT EXISTS idx_chef_availabilities_date ON public.chef_availabilities(date);

COMMENT ON TABLE public.chef_availabilities IS 'Phase 2V: Chef availability by day; admin can override';
