-- Phase 2AX: Experimentation Framework — test pricing, messaging, ops, incentives safely

CREATE TYPE public.experiment_status AS ENUM ('RUNNING', 'STOPPED', 'COMPLETE');

CREATE TABLE IF NOT EXISTS public.experiments (
  id               TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name             TEXT NOT NULL,
  category         TEXT,
  variant_a         JSONB NOT NULL,
  variant_b         JSONB NOT NULL,
  metric           TEXT NOT NULL,
  secondary_metric  TEXT,
  start_at         TIMESTAMPTZ NOT NULL,
  end_at           TIMESTAMPTZ NOT NULL,
  status           public.experiment_status NOT NULL DEFAULT 'STOPPED',
  harm_threshold   JSONB,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_experiments_status ON public.experiments(status);
CREATE INDEX IF NOT EXISTS idx_experiments_category ON public.experiments(category);
COMMENT ON TABLE public.experiments IS 'Phase 2AX: A/B experiments (pricing, messaging, ops, incentives).';

CREATE TABLE IF NOT EXISTS public.experiment_assignments (
  id            TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  experiment_id TEXT NOT NULL REFERENCES public.experiments(id) ON DELETE CASCADE,
  entity_id     TEXT NOT NULL,
  variant       TEXT NOT NULL,
  assigned_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(experiment_id, entity_id)
);

CREATE INDEX IF NOT EXISTS idx_experiment_assignments_experiment ON public.experiment_assignments(experiment_id);
COMMENT ON TABLE public.experiment_assignments IS 'Phase 2AX: Deterministic 50/50 variant per entity (booking/user).';

CREATE TABLE IF NOT EXISTS public.experiment_outcomes (
  id            TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  experiment_id TEXT NOT NULL REFERENCES public.experiments(id) ON DELETE CASCADE,
  entity_id     TEXT NOT NULL,
  variant       TEXT NOT NULL,
  metric        TEXT NOT NULL,
  value         NUMERIC NOT NULL,
  recorded_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_experiment_outcomes_experiment ON public.experiment_outcomes(experiment_id);
CREATE INDEX IF NOT EXISTS idx_experiment_outcomes_variant_metric ON public.experiment_outcomes(experiment_id, variant, metric);
COMMENT ON TABLE public.experiment_outcomes IS 'Phase 2AX: Metric recordings per entity/variant for results.';
