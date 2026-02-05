-- Phase 2AQ — Continuous Improvement Backlog (insights → shipped)
-- Run manually if Prisma migrate reports drift.

CREATE TABLE IF NOT EXISTS public.improvement_items (
  id TEXT PRIMARY KEY,
  source TEXT NOT NULL,
  title TEXT NOT NULL,
  impact TEXT NOT NULL,
  effort TEXT NOT NULL,
  urgency TEXT NOT NULL DEFAULT 'Medium',
  owner TEXT NULL,
  status TEXT NOT NULL DEFAULT 'Backlog',
  outcome_note TEXT NULL,
  completed_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_improvement_items_status ON public.improvement_items(status);
CREATE INDEX IF NOT EXISTS idx_improvement_items_created_at ON public.improvement_items(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_improvement_items_completed_at ON public.improvement_items(completed_at DESC) WHERE completed_at IS NOT NULL;

COMMENT ON TABLE public.improvement_items IS 'Phase 2AQ: Continuous improvement backlog; score = impact × urgency ÷ effort';
