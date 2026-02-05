-- Phase 2M — Chef Education Modules
-- Run manually if Prisma migrate reports drift.
-- Creates: education_modules, education_progress.

-- UserRole enum should already exist; we use TEXT for role.
CREATE TABLE IF NOT EXISTS public.education_modules (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('ADMIN','STAFF','PARTNER','USER','COORDINATOR','CHEF','FARMER','VOLUNTEER')),
  content TEXT NOT NULL DEFAULT '',
  required BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- user_id TEXT to match Prisma users.id (String)
CREATE TABLE IF NOT EXISTS public.education_progress (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  module_id TEXT NOT NULL REFERENCES public.education_modules(id) ON DELETE CASCADE,
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  UNIQUE (user_id, module_id)
);

CREATE INDEX IF NOT EXISTS idx_education_progress_user_id ON public.education_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_education_progress_module_id ON public.education_progress(module_id);

COMMENT ON TABLE public.education_modules IS 'Phase 2M: Chef (and role) training modules';
COMMENT ON TABLE public.education_progress IS 'Phase 2M: User completion per module';
