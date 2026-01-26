-- Phase 11G.1: Farmer Applications Enhancement
-- Add parish field and voice_ready flag

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
