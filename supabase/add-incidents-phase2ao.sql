-- Phase 2AO — Incident Postmortems (blameless learning, action items)
-- Run manually if Prisma migrate reports drift.

CREATE TABLE IF NOT EXISTS public.incidents (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  severity TEXT NOT NULL,
  summary TEXT NOT NULL,
  impact TEXT NULL,
  root_cause TEXT NULL,
  what_went_well TEXT NULL,
  what_to_improve TEXT NULL,
  actions JSONB NULL,
  closed_at TIMESTAMPTZ NULL,
  booking_id TEXT NULL REFERENCES public.booking_inquiries(id) ON DELETE SET NULL,
  chef_id TEXT NULL REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_incidents_booking_id ON public.incidents(booking_id);
CREATE INDEX IF NOT EXISTS idx_incidents_chef_id ON public.incidents(chef_id);
CREATE INDEX IF NOT EXISTS idx_incidents_created_at ON public.incidents(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_incidents_severity ON public.incidents(severity);

COMMENT ON TABLE public.incidents IS 'Phase 2AO: Incident postmortems; read-only after closure; action items tracked';
