-- Phase 2P — Badges & Certifications
-- Run manually if Prisma migrate reports drift.

CREATE TABLE IF NOT EXISTS public.badges (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  criteria TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL CHECK (role IN ('ADMIN','STAFF','PARTNER','USER','COORDINATOR','CHEF','FARMER','VOLUNTEER'))
);

CREATE TABLE IF NOT EXISTS public.user_badges (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  badge_id TEXT NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  awarded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, badge_id)
);

CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON public.user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_badge_id ON public.user_badges(badge_id);

COMMENT ON TABLE public.badges IS 'Phase 2P: Badge definitions (name, criteria, role)';
COMMENT ON TABLE public.user_badges IS 'Phase 2P: Awarded badges per user';
