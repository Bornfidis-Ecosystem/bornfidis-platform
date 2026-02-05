-- Phase 2AZ: AI-Assisted Ops Insights — actionable insights with confidence, snooze, action log

CREATE TABLE IF NOT EXISTS public.ai_ops_insights (
  id               TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  category         TEXT NOT NULL,
  title            TEXT NOT NULL,
  why_it_matters   TEXT NOT NULL,
  suggested_action TEXT NOT NULL,
  confidence_pct   INTEGER NOT NULL,
  entity_type      TEXT NOT NULL,
  entity_id        TEXT,
  metadata         JSONB,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  snoozed_until    TIMESTAMPTZ,
  action_taken     TEXT,
  action_taken_at  TIMESTAMPTZ,
  action_taken_by  TEXT
);

CREATE INDEX IF NOT EXISTS idx_ai_ops_insights_category ON public.ai_ops_insights(category);
CREATE INDEX IF NOT EXISTS idx_ai_ops_insights_entity_id ON public.ai_ops_insights(entity_id);
CREATE INDEX IF NOT EXISTS idx_ai_ops_insights_created_at ON public.ai_ops_insights(created_at DESC);
COMMENT ON TABLE public.ai_ops_insights IS 'Phase 2AZ: Rules + ML-style insights; confidence, snooze, action taken.';

CREATE TABLE IF NOT EXISTS public.ai_ops_category_toggles (
  id         TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  category   TEXT NOT NULL UNIQUE,
  enabled    BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.ai_ops_category_toggles IS 'Phase 2AZ: Toggle insight categories on/off.';
