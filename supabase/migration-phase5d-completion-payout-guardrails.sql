-- Phase 5D: Completion + Payout Release Guardrails
-- Add job completion tracking and payout hold controls

-- Update booking_inquiries with completion and payout hold fields
ALTER TABLE booking_inquiries
ADD COLUMN IF NOT EXISTS job_completed_at TIMESTAMP WITH TIME ZONE NULL,
ADD COLUMN IF NOT EXISTS job_completed_by TEXT NULL, -- 'chef' or 'admin'
ADD COLUMN IF NOT EXISTS payout_hold BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS payout_hold_reason TEXT NULL,
ADD COLUMN IF NOT EXISTS payout_released_at TIMESTAMP WITH TIME ZONE NULL;

-- Create indexes for completion and payout fields
CREATE INDEX IF NOT EXISTS idx_booking_job_completed_at ON booking_inquiries(job_completed_at) WHERE job_completed_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_booking_payout_hold ON booking_inquiries(payout_hold) WHERE payout_hold = TRUE;
CREATE INDEX IF NOT EXISTS idx_booking_payout_released_at ON booking_inquiries(payout_released_at) WHERE payout_released_at IS NOT NULL;

-- Update booking_chefs with enhanced payout status tracking
ALTER TABLE booking_chefs
ADD COLUMN IF NOT EXISTS payout_status TEXT NOT NULL DEFAULT 'pending', -- pending | on_hold | paid | failed
ADD COLUMN IF NOT EXISTS payout_error TEXT NULL,
ADD COLUMN IF NOT EXISTS transfer_id TEXT NULL;

-- Create index on payout_status
CREATE INDEX IF NOT EXISTS idx_booking_chefs_payout_status ON booking_chefs(payout_status);

-- Update existing booking_chefs records to set payout_status based on current status
DO $$
BEGIN
  -- Set payout_status based on existing status field
  UPDATE booking_chefs
  SET payout_status = CASE
    WHEN status = 'paid' THEN 'paid'
    WHEN status = 'completed' THEN 'pending'
    ELSE 'pending'
  END
  WHERE payout_status = 'pending'; -- Only update if still default

  -- Migrate stripe_transfer_id to transfer_id if exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'booking_chefs' AND column_name = 'stripe_transfer_id'
  ) THEN
    UPDATE booking_chefs
    SET transfer_id = stripe_transfer_id
    WHERE transfer_id IS NULL AND stripe_transfer_id IS NOT NULL;
  END IF;
END $$;

-- Note: payout_status values:
-- 'pending' - Eligible for payout, awaiting completion/hold release
-- 'on_hold' - Payout blocked by admin
-- 'paid' - Payout completed successfully
-- 'failed' - Payout attempt failed

-- Note: job_completed_by values:
-- 'chef' - Chef marked job as complete via portal
-- 'admin' - Admin confirmed completion
