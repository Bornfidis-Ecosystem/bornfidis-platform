-- Phase 2BA: Workforce Succession Planning — key roles always covered (primary + backups, readiness, training path)

CREATE TYPE public.succession_assignment_type AS ENUM ('PRIMARY', 'BACKUP');
CREATE TYPE public.succession_readiness AS ENUM ('READY', 'NEAR_READY', 'DEVELOPING');

CREATE TABLE IF NOT EXISTS public.succession_roles (
  id         TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name       TEXT NOT NULL,
  code       TEXT NOT NULL UNIQUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.succession_assignments (
  id                   TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  succession_role_id   TEXT NOT NULL REFERENCES public.succession_roles(id) ON DELETE CASCADE,
  user_id              TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  assignment_type      public.succession_assignment_type NOT NULL,
  readiness            public.succession_readiness NOT NULL DEFAULT 'DEVELOPING',
  training_path_notes  TEXT,
  last_review_at       TIMESTAMPTZ,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(succession_role_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_succession_assignments_role ON public.succession_assignments(succession_role_id);
CREATE INDEX IF NOT EXISTS idx_succession_assignments_user ON public.succession_assignments(user_id);

COMMENT ON TABLE public.succession_roles IS 'Phase 2BA: Critical roles (Lead Chef Elite, Regional Coordinator, Ops Lead).';
COMMENT ON TABLE public.succession_assignments IS 'Phase 2BA: Primary and backup per role; readiness and training path.';
