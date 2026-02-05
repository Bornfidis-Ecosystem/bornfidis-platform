-- Phase 2AY: Long-Term Capacity Planning — inputs and config (outputs computed on the fly)

CREATE TABLE IF NOT EXISTS public.capacity_config (
  id                         TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  label                      TEXT NOT NULL DEFAULT 'default',
  growth_rate_pct_per_month  NUMERIC NOT NULL DEFAULT 0,
  avg_jobs_per_chef_per_day  NUMERIC,
  attrition_rate_pct_per_month NUMERIC NOT NULL DEFAULT 0,
  seasonality_multipliers    JSONB,
  created_at                 TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                 TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.capacity_config IS 'Phase 2AY: Capacity planning assumptions (growth, attrition, seasonality).';
