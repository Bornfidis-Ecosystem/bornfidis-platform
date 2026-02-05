-- Phase 2X — Featured Chefs (max 5, eligibility + admin override)
-- Run manually if Prisma migrate reports drift.

CREATE TABLE IF NOT EXISTS public.chef_features (
  chef_id TEXT PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  featured BOOLEAN NOT NULL DEFAULT false,
  admin_override BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.chef_features IS 'Phase 2X: Featured chefs; admin can override eligibility';
