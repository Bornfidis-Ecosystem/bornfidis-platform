-- Phase 2BC: Risk Register & Mitigation — single source of truth for operational, financial, quality, capacity, tech, compliance risks

CREATE TYPE public.risk_impact AS ENUM ('LOW', 'MEDIUM', 'HIGH');
CREATE TYPE public.risk_likelihood AS ENUM ('LOW', 'MEDIUM', 'HIGH');
CREATE TYPE public.risk_status AS ENUM ('OPEN', 'MONITORING', 'CLOSED');

CREATE TABLE IF NOT EXISTS public.risks (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  category    TEXT NOT NULL,
  risk        TEXT NOT NULL,
  impact      public.risk_impact NOT NULL,
  likelihood  public.risk_likelihood NOT NULL,
  mitigation  TEXT NOT NULL,
  owner       TEXT,
  status      public.risk_status NOT NULL DEFAULT 'OPEN',
  reviewed_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_risks_category ON public.risks(category);
CREATE INDEX IF NOT EXISTS idx_risks_status ON public.risks(status);

COMMENT ON TABLE public.risks IS 'Phase 2BC: Risk register; category, impact, likelihood, mitigation, owner, status, review cadence.';
