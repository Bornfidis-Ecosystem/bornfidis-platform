-- Phase 2I — Chef Assignments (Chef Bookings & Prep Flow)
-- Run this manually if Prisma migrate reports drift.
-- Creates: ChefBookingStatus enum, chef_assignments table.

-- Enum for chef workflow status
DO $$ BEGIN
  CREATE TYPE "ChefBookingStatus" AS ENUM ('ASSIGNED', 'CONFIRMED', 'IN_PREP', 'COMPLETED');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Table: chef_assignments (one per booking; chefId = users.id). Use TEXT to match Prisma String/uuid() columns.
CREATE TABLE IF NOT EXISTS public.chef_assignments (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  booking_id TEXT NOT NULL UNIQUE REFERENCES public.booking_inquiries(id) ON DELETE CASCADE,
  chef_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status "ChefBookingStatus" NOT NULL DEFAULT 'ASSIGNED',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_chef_assignments_chef_id ON public.chef_assignments(chef_id);
CREATE INDEX IF NOT EXISTS idx_chef_assignments_booking_id ON public.chef_assignments(booking_id);

COMMENT ON TABLE public.chef_assignments IS 'Phase 2I: Chef workflow status per booking (ASSIGNED → CONFIRMED → IN_PREP → COMPLETED)';
