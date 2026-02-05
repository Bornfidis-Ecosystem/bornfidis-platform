-- Phase 2AA — Chef Leaderboard (score: rating 40%, on-time 25%, prep 20%, jobs 15%)
-- Run manually if Prisma migrate reports drift.

CREATE TABLE IF NOT EXISTS public.leaderboard_snapshots (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  chef_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  rank INTEGER NOT NULL,
  score DOUBLE PRECISION NOT NULL,
  rating_pct DOUBLE PRECISION NOT NULL,
  on_time_pct DOUBLE PRECISION NOT NULL,
  prep_pct DOUBLE PRECISION NOT NULL,
  jobs_pct DOUBLE PRECISION NOT NULL,
  jobs_completed INTEGER NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  calculated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_leaderboard_snapshots_chef_id ON public.leaderboard_snapshots(chef_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_snapshots_rank ON public.leaderboard_snapshots(rank);
CREATE INDEX IF NOT EXISTS idx_leaderboard_snapshots_calculated_at ON public.leaderboard_snapshots(calculated_at);

CREATE TABLE IF NOT EXISTS public.chef_leaderboard_exclusions (
  chef_id TEXT PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  excluded BOOLEAN NOT NULL DEFAULT false,
  excluded_at TIMESTAMPTZ NULL,
  excluded_by TEXT NULL
);

COMMENT ON TABLE public.leaderboard_snapshots IS 'Phase 2AA: Cached leaderboard; recalculated nightly';
COMMENT ON TABLE public.chef_leaderboard_exclusions IS 'Phase 2AA: Admin can temporarily exclude chef from leaderboard';
