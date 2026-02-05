-- Phase 2AV: Margin Guardrails — prevent underpriced bookings and bonus overruns
-- Enforced at: pricing preview, booking confirmation, payout creation. Block or warn (admin choice).

CREATE TABLE IF NOT EXISTS public.margin_guardrail_config (
  id                    TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  region_code           TEXT UNIQUE,  -- NULL = global config
  min_gross_margin_pct  NUMERIC NOT NULL DEFAULT 25,
  max_bonus_plus_tier_pct NUMERIC NOT NULL DEFAULT 20,
  max_surge_multiplier  NUMERIC,
  min_job_value_cents   INTEGER,
  block_or_warn         BOOLEAN NOT NULL DEFAULT true,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_margin_guardrail_config_region ON public.margin_guardrail_config(region_code);
COMMENT ON TABLE public.margin_guardrail_config IS 'Phase 2AV: Margin guardrail thresholds (global or per region).';

CREATE TABLE IF NOT EXISTS public.margin_override_log (
  id         TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  booking_id TEXT NOT NULL REFERENCES public.booking_inquiries(id) ON DELETE CASCADE,
  user_id    TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  action     TEXT NOT NULL,
  reason     TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_margin_override_log_booking ON public.margin_override_log(booking_id);
CREATE INDEX IF NOT EXISTS idx_margin_override_log_user ON public.margin_override_log(user_id);
COMMENT ON TABLE public.margin_override_log IS 'Phase 2AV: Audit log of admin overrides for margin guardrails.';
