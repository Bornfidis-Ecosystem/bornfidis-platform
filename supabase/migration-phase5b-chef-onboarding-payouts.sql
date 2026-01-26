-- Phase 5B: Chef Onboarding + Payout Engine
-- Add Stripe Connect onboarding fields, booking payout tracking, and payout ledger

-- Update chefs table with Phase 5B fields
ALTER TABLE chefs
ADD COLUMN IF NOT EXISTS stripe_connect_account_id TEXT NULL,
ADD COLUMN IF NOT EXISTS stripe_connect_status TEXT NOT NULL DEFAULT 'not_connected',
ADD COLUMN IF NOT EXISTS stripe_onboarded_at TIMESTAMP WITH TIME ZONE NULL,
ADD COLUMN IF NOT EXISTS payouts_enabled BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS chef_portal_token TEXT UNIQUE DEFAULT gen_random_uuid()::text;

-- Update existing stripe_account_id to stripe_connect_account_id if needed
-- (Keep both for backward compatibility during transition)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'chefs' AND column_name = 'stripe_account_id'
  ) THEN
    -- Migrate existing stripe_account_id to stripe_connect_account_id if null
    UPDATE chefs 
    SET stripe_connect_account_id = stripe_account_id 
    WHERE stripe_connect_account_id IS NULL AND stripe_account_id IS NOT NULL;
  END IF;
END $$;

-- Create index on chef_portal_token
CREATE INDEX IF NOT EXISTS idx_chefs_portal_token ON chefs(chef_portal_token);
CREATE INDEX IF NOT EXISTS idx_chefs_connect_status ON chefs(stripe_connect_status);
CREATE INDEX IF NOT EXISTS idx_chefs_payouts_enabled ON chefs(payouts_enabled) WHERE payouts_enabled = TRUE;

-- Update booking_inquiries with chef assignment and payout fields
ALTER TABLE booking_inquiries
ADD COLUMN IF NOT EXISTS assigned_chef_id UUID NULL REFERENCES chefs(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS chef_payout_amount_cents INTEGER NULL,
ADD COLUMN IF NOT EXISTS chef_payout_status TEXT NOT NULL DEFAULT 'not_applicable',
ADD COLUMN IF NOT EXISTS chef_payout_blockers TEXT[] NULL,
ADD COLUMN IF NOT EXISTS chef_payout_paid_at TIMESTAMP WITH TIME ZONE NULL,
ADD COLUMN IF NOT EXISTS stripe_transfer_id TEXT NULL;

-- Create indexes for booking chef fields
CREATE INDEX IF NOT EXISTS idx_booking_assigned_chef_id ON booking_inquiries(assigned_chef_id);
CREATE INDEX IF NOT EXISTS idx_booking_chef_payout_status ON booking_inquiries(chef_payout_status);
CREATE INDEX IF NOT EXISTS idx_booking_stripe_transfer_id ON booking_inquiries(stripe_transfer_id);

-- Create chef_payouts ledger table (idempotency: booking_id is UNIQUE)
CREATE TABLE IF NOT EXISTS chef_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES booking_inquiries(id) ON DELETE CASCADE UNIQUE,
  chef_id UUID NOT NULL REFERENCES chefs(id) ON DELETE RESTRICT,
  amount_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'usd',
  status TEXT NOT NULL DEFAULT 'pending', -- pending | paid | failed
  stripe_transfer_id TEXT NULL UNIQUE,
  error_message TEXT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  paid_at TIMESTAMP WITH TIME ZONE NULL
);

-- Create indexes for chef_payouts
CREATE INDEX IF NOT EXISTS idx_chef_payouts_booking_id ON chef_payouts(booking_id);
CREATE INDEX IF NOT EXISTS idx_chef_payouts_chef_id ON chef_payouts(chef_id);
CREATE INDEX IF NOT EXISTS idx_chef_payouts_status ON chef_payouts(status);
CREATE INDEX IF NOT EXISTS idx_chef_payouts_stripe_transfer_id ON chef_payouts(stripe_transfer_id);
CREATE INDEX IF NOT EXISTS idx_chef_payouts_created_at ON chef_payouts(created_at DESC);

-- Enable RLS on chef_payouts
ALTER TABLE chef_payouts ENABLE ROW LEVEL SECURITY;

-- Note: stripe_connect_status enum values:
-- 'not_connected' - No Stripe account created
-- 'pending' - Account created, onboarding in progress
-- 'connected' - Fully onboarded (charges_enabled && payouts_enabled)
-- 'restricted' - Account has restrictions (details_submitted but payouts disabled)

-- Note: chef_payout_status enum values:
-- 'not_applicable' - No chef assigned
-- 'pending' - Eligible but not yet paid
-- 'paid' - Payout completed
-- 'blocked' - Cannot pay (chef not onboarded, account restricted, etc.)

-- Note: chef_payouts.status enum values:
-- 'pending' - Created but not yet processed
-- 'paid' - Transfer successful
-- 'failed' - Transfer failed
