-- Phase 5C: Chef Assignment & Earnings Engine
-- Create booking_chefs table for simplified chef assignment tracking

-- Create booking_chefs table (simplified assignment tracking)
CREATE TABLE IF NOT EXISTS booking_chefs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES booking_inquiries(id) ON DELETE CASCADE,
  chef_id UUID NOT NULL REFERENCES chefs(id) ON DELETE RESTRICT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  
  -- Payout configuration
  payout_percentage INTEGER NOT NULL DEFAULT 70, -- Chef gets this percentage
  payout_amount_cents INTEGER NOT NULL DEFAULT 0, -- Calculated amount
  
  -- Status tracking
  status TEXT NOT NULL DEFAULT 'assigned', -- assigned | completed | paid
  
  -- Timestamps
  completed_at TIMESTAMP WITH TIME ZONE NULL,
  paid_at TIMESTAMP WITH TIME ZONE NULL,
  
  -- Stripe transfer tracking
  stripe_transfer_id TEXT NULL,
  
  -- Notes
  notes TEXT NULL,
  
  -- Ensure one chef per booking
  UNIQUE(booking_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_booking_chefs_booking_id ON booking_chefs(booking_id);
CREATE INDEX IF NOT EXISTS idx_booking_chefs_chef_id ON booking_chefs(chef_id);
CREATE INDEX IF NOT EXISTS idx_booking_chefs_status ON booking_chefs(status);
CREATE INDEX IF NOT EXISTS idx_booking_chefs_stripe_transfer_id ON booking_chefs(stripe_transfer_id);

-- Enable RLS
ALTER TABLE booking_chefs ENABLE ROW LEVEL SECURITY;

-- Update trigger for updated_at
CREATE TRIGGER update_booking_chefs_updated_at BEFORE UPDATE ON booking_chefs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Note: status values:
-- 'assigned' - Chef assigned to booking
-- 'completed' - Booking completed, awaiting payout
-- 'paid' - Payout completed
