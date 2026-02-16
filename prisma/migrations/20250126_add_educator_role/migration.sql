-- Add EDUCATOR to UserRole enum (Phase 1 invite flow)
-- If this fails with "already exists", the value is already there.
ALTER TYPE "UserRole" ADD VALUE 'EDUCATOR';
