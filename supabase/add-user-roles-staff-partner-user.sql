-- Bornfidis Auth + Roles (Phase 1): Add STAFF, PARTNER, USER to UserRole enum
-- Run this if your DB already has UserRole but without these values.
-- PostgreSQL: ADD VALUE is safe (no table rewrite). Order doesn't matter for enum.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid WHERE t.typname = 'UserRole' AND e.enumlabel = 'STAFF') THEN
    ALTER TYPE "UserRole" ADD VALUE 'STAFF';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid WHERE t.typname = 'UserRole' AND e.enumlabel = 'PARTNER') THEN
    ALTER TYPE "UserRole" ADD VALUE 'PARTNER';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid WHERE t.typname = 'UserRole' AND e.enumlabel = 'USER') THEN
    ALTER TYPE "UserRole" ADD VALUE 'USER';
  END IF;
END
$$;
