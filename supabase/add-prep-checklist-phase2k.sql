-- Phase 2K — Chef Prep Checklist Templates
-- Run manually if Prisma migrate reports drift.
-- Creates: prep_checklist_templates, chef_prep_checklists.

-- Templates (admin-controlled)
CREATE TABLE IF NOT EXISTS public.prep_checklist_templates (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  items JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Per-booking checklist progress (chefId = users.id). Use TEXT to match Prisma String/uuid() columns.
CREATE TABLE IF NOT EXISTS public.chef_prep_checklists (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  booking_id TEXT NOT NULL UNIQUE REFERENCES public.booking_inquiries(id) ON DELETE CASCADE,
  chef_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  template_id TEXT REFERENCES public.prep_checklist_templates(id) ON DELETE SET NULL,
  completed JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_chef_prep_checklists_chef_id ON public.chef_prep_checklists(chef_id);
CREATE INDEX IF NOT EXISTS idx_chef_prep_checklists_booking_id ON public.chef_prep_checklists(booking_id);

COMMENT ON TABLE public.prep_checklist_templates IS 'Phase 2K: Admin-controlled prep checklist templates (items: [{ label, required }])';
COMMENT ON TABLE public.chef_prep_checklists IS 'Phase 2K: Chef progress per booking (completed: { "0": true, "1": false })';
