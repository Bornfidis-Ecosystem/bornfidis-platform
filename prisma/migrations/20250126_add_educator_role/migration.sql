-- Add EDUCATOR to UserRole enum (Phase 1 invite flow).
-- Idempotent: no-op if UserRole type does not exist (e.g. shadow DB replay).
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'UserRole') THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_enum e
      JOIN pg_type t ON e.enumtypid = t.oid
      WHERE t.typname = 'UserRole' AND e.enumlabel = 'EDUCATOR'
    ) THEN
      ALTER TYPE "UserRole" ADD VALUE 'EDUCATOR';
    END IF;
  END IF;
END $$;
