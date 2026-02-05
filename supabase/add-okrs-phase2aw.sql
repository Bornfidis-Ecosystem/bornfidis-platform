-- Phase 2AW: OKR Tracking — objectives and key results, auto-updated from ops/forecast/reviews

CREATE TABLE IF NOT EXISTS public.okrs (
  id         TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  period     TEXT NOT NULL,
  objective  TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_okrs_period ON public.okrs(period);
COMMENT ON TABLE public.okrs IS 'Phase 2AW: Objectives per period (e.g. Q1-2026).';

CREATE TABLE IF NOT EXISTS public.key_results (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  okr_id      TEXT NOT NULL REFERENCES public.okrs(id) ON DELETE CASCADE,
  metric      TEXT NOT NULL,
  target      NUMERIC NOT NULL,
  current     NUMERIC NOT NULL DEFAULT 0,
  notes       TEXT,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_key_results_okr_id ON public.key_results(okr_id);
COMMENT ON TABLE public.key_results IS 'Phase 2AW: Key results per OKR; current value auto-updated from live data.';
