-- Phase 2Z — Coaching Workflows (private; chef + admin only)
-- Run manually if Prisma migrate reports drift.

CREATE TABLE IF NOT EXISTS public.coaching_cases (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  chef_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  status TEXT NOT NULL,
  due_at TIMESTAMPTZ NULL,
  assigned_coach_id TEXT NULL REFERENCES public.users(id) ON DELETE SET NULL,
  action_plan_note TEXT NULL,
  resolved_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_coaching_cases_chef_id ON public.coaching_cases(chef_id);
CREATE INDEX IF NOT EXISTS idx_coaching_cases_status ON public.coaching_cases(status);

COMMENT ON TABLE public.coaching_cases IS 'Phase 2Z: Coaching cases; triggers create OPEN; admin assigns coach, sets plan, clears';
