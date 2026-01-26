-- Phase 6A: Island Harvest Hub – Farmer & Producer Network
-- Create farmers and booking_farmers tables for regenerative supplier network

-- Farmers table
CREATE TABLE IF NOT EXISTS farmers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  
  -- Basic info
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  location TEXT,
  parish TEXT,
  country TEXT DEFAULT 'Jamaica',
  
  -- Regenerative practices
  regenerative_practices TEXT, -- Description of regenerative practices
  certifications TEXT[], -- Array of certifications
  crops TEXT[], -- Array of crops grown
  proteins TEXT[], -- Array of proteins (fish, meat, etc.)
  processing_capabilities TEXT[], -- Array of processing capabilities
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending', -- pending, approved, inactive
  approved_at TIMESTAMP WITH TIME ZONE NULL,
  approved_by UUID NULL, -- Admin user ID
  rejection_reason TEXT NULL,
  
  -- Stripe Connect
  stripe_account_id TEXT NULL UNIQUE, -- Stripe Express account ID
  stripe_connect_status TEXT NOT NULL DEFAULT 'not_connected', -- not_connected, pending, connected, restricted
  stripe_onboarded_at TIMESTAMP WITH TIME ZONE NULL,
  payouts_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  farmer_portal_token TEXT UNIQUE DEFAULT gen_random_uuid()::text,
  
  -- Payment info
  payout_percentage INTEGER DEFAULT 60 NOT NULL, -- Default 60% to farmer
  
  -- Profile
  profile_image_url TEXT NULL,
  website_url TEXT NULL,
  instagram_handle TEXT NULL,
  
  -- Admin notes
  admin_notes TEXT NULL
);

-- Booking farmers table (many-to-many with role)
CREATE TABLE IF NOT EXISTS booking_farmers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES booking_inquiries(id) ON DELETE CASCADE,
  farmer_id UUID NOT NULL REFERENCES farmers(id) ON DELETE RESTRICT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  
  -- Role in booking
  role TEXT NOT NULL, -- produce, fish, meat, dairy, spice, beverage
  
  -- Payout configuration
  payout_percent INTEGER NOT NULL DEFAULT 60, -- Farmer gets this percentage
  payout_amount_cents INTEGER NOT NULL DEFAULT 0, -- Calculated amount
  
  -- Status tracking
  payout_status TEXT NOT NULL DEFAULT 'pending', -- pending | on_hold | paid | failed
  payout_error TEXT NULL,
  transfer_id TEXT NULL,
  
  -- Timestamps
  paid_at TIMESTAMP WITH TIME ZONE NULL,
  
  -- Notes
  notes TEXT NULL,
  
  -- Ensure unique farmer per booking per role (can have multiple roles)
  UNIQUE(booking_id, farmer_id, role)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_farmers_email ON farmers(email);
CREATE INDEX IF NOT EXISTS idx_farmers_status ON farmers(status);
CREATE INDEX IF NOT EXISTS idx_farmers_stripe_account_id ON farmers(stripe_account_id);
CREATE INDEX IF NOT EXISTS idx_farmers_portal_token ON farmers(farmer_portal_token);
CREATE INDEX IF NOT EXISTS idx_farmers_connect_status ON farmers(stripe_connect_status);
CREATE INDEX IF NOT EXISTS idx_farmers_approved_at ON farmers(approved_at);

CREATE INDEX IF NOT EXISTS idx_booking_farmers_booking_id ON booking_farmers(booking_id);
CREATE INDEX IF NOT EXISTS idx_booking_farmers_farmer_id ON booking_farmers(farmer_id);
CREATE INDEX IF NOT EXISTS idx_booking_farmers_role ON booking_farmers(role);
CREATE INDEX IF NOT EXISTS idx_booking_farmers_payout_status ON booking_farmers(payout_status);
CREATE INDEX IF NOT EXISTS idx_booking_farmers_transfer_id ON booking_farmers(transfer_id);

-- Enable RLS
ALTER TABLE farmers ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_farmers ENABLE ROW LEVEL SECURITY;

-- Update trigger for updated_at
CREATE TRIGGER update_farmers_updated_at BEFORE UPDATE ON farmers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_booking_farmers_updated_at BEFORE UPDATE ON booking_farmers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Note: farmer status values:
-- 'pending' - Application submitted, awaiting admin review
-- 'approved' - Approved by admin, awaiting Stripe onboarding
-- 'inactive' - Temporarily inactive (can be reactivated)

-- Note: stripe_connect_status values:
-- 'not_connected' - No Stripe account created
-- 'pending' - Account created, onboarding in progress
-- 'connected' - Fully onboarded (charges_enabled && payouts_enabled)
-- 'restricted' - Account has restrictions

-- Note: payout_status values:
-- 'pending' - Eligible for payout, awaiting completion/hold release
-- 'on_hold' - Payout blocked by admin
-- 'paid' - Payout completed successfully
-- 'failed' - Payout attempt failed

-- Note: role values:
-- 'produce' - Fruits, vegetables, herbs
-- 'fish' - Seafood
-- 'meat' - Meat products
-- 'dairy' - Dairy products
-- 'spice' - Spices and seasonings
-- 'beverage' - Beverages
