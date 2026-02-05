-- Phase 2AK — Web Push (PWA) subscriptions per user/device
-- Run after Prisma migration or apply manually if using Supabase-only migrations

CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id ON public.push_subscriptions(user_id);

COMMENT ON TABLE public.push_subscriptions IS 'Phase 2AK: Web Push subscriptions for PWA notifications (chefs + admins).';
