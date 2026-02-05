-- Phase 2AB — Chef calendar sync (iCal feed; long-lived revocable token)
-- Run manually if Prisma migrate reports drift.

CREATE TABLE IF NOT EXISTS public.chef_calendar_tokens (
  chef_id TEXT PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_chef_calendar_tokens_token ON public.chef_calendar_tokens(token);

COMMENT ON TABLE public.chef_calendar_tokens IS 'Phase 2AB: iCal feed token per chef; regenerate revokes old link';
