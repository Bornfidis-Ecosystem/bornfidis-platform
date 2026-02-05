-- Phase 2AM — SMS fallback for critical alerts (opt-in, rate limit, dedup)
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS sms_enabled BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS phone TEXT;

COMMENT ON COLUMN public.users.sms_enabled IS 'Phase 2AM: Allow SMS fallback for critical alerts; opt-out honored instantly.';
COMMENT ON COLUMN public.users.phone IS 'Phase 2AM: Optional phone for SMS; chefs use partner_profiles.phone.';

CREATE TABLE IF NOT EXISTS public.sms_delivery_log (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  event_key TEXT NOT NULL,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, event_key)
);

CREATE INDEX IF NOT EXISTS idx_sms_delivery_log_user_sent ON public.sms_delivery_log(user_id, sent_at DESC);

COMMENT ON TABLE public.sms_delivery_log IS 'Phase 2AM: One SMS per event per user; used for rate limit and dedup.';
