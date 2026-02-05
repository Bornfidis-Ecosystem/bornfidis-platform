-- Phase 2B — Partner Invites (invite-only onboarding)
-- Run this if Prisma migrate is not used, to create the invites table.

CREATE TABLE IF NOT EXISTS public.invites (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  role "UserRole" NOT NULL,
  token TEXT NOT NULL UNIQUE,
  invited_by TEXT NOT NULL,
  accepted BOOLEAN NOT NULL DEFAULT false,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_invites_token ON public.invites (token);
CREATE INDEX IF NOT EXISTS idx_invites_email ON public.invites (email);
CREATE INDEX IF NOT EXISTS idx_invites_expires_at ON public.invites (expires_at);

COMMENT ON TABLE public.invites IS 'Phase 2B: Partner invites (invite-only onboarding). One-time token, 7-day expiry.';
