-- Phase 2Y — Chef Time Slots (within-day availability)
-- Run manually if Prisma migrate reports drift.

CREATE TABLE IF NOT EXISTS public.chef_time_slots (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  chef_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_chef_time_slots_chef_date ON public.chef_time_slots(chef_id, date);

COMMENT ON TABLE public.chef_time_slots IS 'Phase 2Y: Time slots per chef per day; no overlapping slots';
