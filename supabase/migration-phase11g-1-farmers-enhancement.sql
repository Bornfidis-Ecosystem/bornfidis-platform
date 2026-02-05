-- Phase 11G.1: Farmer Applications Enhancement
-- Ensures farmers_applications exists, then adds parish and voice_ready.

-- Create base table if not present (so this file can be run without migration-phase11g-farmers.sql)
CREATE TABLE IF NOT EXISTS farmers_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  acres NUMERIC NULL,
  crops TEXT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  notes TEXT NULL
);

CREATE INDEX IF NOT EXISTS idx_farmers_applications_status ON farmers_applications(status);
CREATE INDEX IF NOT EXISTS idx_farmers_applications_created_at ON farmers_applications(created_at DESC);

-- Add parish column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'farmers_applications' AND column_name = 'parish'
  ) THEN
    ALTER TABLE farmers_applications ADD COLUMN parish TEXT NULL;
  END IF;
END $$;

-- Add voice_ready flag if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'farmers_applications' AND column_name = 'voice_ready'
  ) THEN
    ALTER TABLE farmers_applications ADD COLUMN voice_ready BOOLEAN NOT NULL DEFAULT FALSE;
  END IF;
END $$;

-- Add index on parish for filtering
CREATE INDEX IF NOT EXISTS idx_farmers_applications_parish ON farmers_applications(parish);

-- Add index on voice_ready for filtering
CREATE INDEX IF NOT EXISTS idx_farmers_applications_voice_ready ON farmers_applications(voice_ready);
