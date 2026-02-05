-- Phase 2BD: Automated Growth Experiments — hypothesis, winner declared, promoted

ALTER TABLE public.experiments
  ADD COLUMN IF NOT EXISTS hypothesis TEXT,
  ADD COLUMN IF NOT EXISTS winner_variant TEXT,
  ADD COLUMN IF NOT EXISTS promoted_at TIMESTAMPTZ;

COMMENT ON COLUMN public.experiments.hypothesis IS 'Phase 2BD: e.g. Surge 1.2x increases revenue without hurting conversion.';
COMMENT ON COLUMN public.experiments.winner_variant IS 'Phase 2BD: A or B when winner declared.';
COMMENT ON COLUMN public.experiments.promoted_at IS 'Phase 2BD: when winner was promoted to default.';
