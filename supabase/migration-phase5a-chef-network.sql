-- Phase 5A: Chef Partner Network
-- Create chefs, chef_availability, and booking_assignments tables

-- Chefs table
CREATE TABLE IF NOT EXISTS chefs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  
  -- Application info
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  bio TEXT,
  experience_years INTEGER,
  specialties TEXT[], -- Array of specialties
  certifications TEXT[], -- Array of certifications
  
  -- Application status
  status TEXT DEFAULT 'pending' NOT NULL, -- pending, approved, rejected, active, inactive
  application_submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  approved_at TIMESTAMP WITH TIME ZONE NULL,
  approved_by UUID NULL, -- Admin user ID
  rejection_reason TEXT NULL,
  
  -- Stripe Connect
  stripe_account_id TEXT NULL UNIQUE, -- Stripe Express account ID
  stripe_account_status TEXT NULL, -- onboar, active, restricted, etc.
  stripe_onboarding_complete BOOLEAN DEFAULT FALSE NOT NULL,
  stripe_onboarding_link TEXT NULL,
  stripe_onboarding_link_expires_at TIMESTAMP WITH TIME ZONE NULL,
  
  -- Payment info
  payout_percentage INTEGER DEFAULT 70 NOT NULL, -- Default 70% to chef
  tax_id TEXT NULL, -- For tax reporting
  
  -- Profile
  profile_image_url TEXT NULL,
  website_url TEXT NULL,
  instagram_handle TEXT NULL,
  
  -- Admin notes
  admin_notes TEXT NULL
);

-- Chef availability table
CREATE TABLE IF NOT EXISTS chef_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chef_id UUID NOT NULL REFERENCES chefs(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  available BOOLEAN DEFAULT TRUE NOT NULL,
  start_time TIME NULL, -- Optional time range
  end_time TIME NULL,
  notes TEXT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(chef_id, date)
);

-- Booking assignments table
CREATE TABLE IF NOT EXISTS booking_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES booking_inquiries(id) ON DELETE CASCADE,
  chef_id UUID NOT NULL REFERENCES chefs(id) ON DELETE RESTRICT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  assigned_by UUID NULL, -- Admin user ID
  
  -- Payout calculation
  booking_total_cents INTEGER NOT NULL, -- Snapshot of total at assignment time
  chef_payout_percentage INTEGER NOT NULL DEFAULT 70,
  chef_payout_cents INTEGER NOT NULL, -- Calculated: booking_total_cents * chef_payout_percentage / 100
  platform_fee_cents INTEGER NOT NULL, -- Calculated: booking_total_cents - chef_payout_cents
  
  -- Payment status
  payout_status TEXT DEFAULT 'pending' NOT NULL, -- pending, processing, paid, failed
  payout_paid_at TIMESTAMP WITH TIME ZONE NULL,
  stripe_payout_id TEXT NULL, -- Stripe payout ID when processed
  payout_failure_reason TEXT NULL,
  
  -- Status
  status TEXT DEFAULT 'assigned' NOT NULL, -- assigned, confirmed, completed, cancelled
  chef_confirmed_at TIMESTAMP WITH TIME ZONE NULL,
  completed_at TIMESTAMP WITH TIME ZONE NULL,
  cancelled_at TIMESTAMP WITH TIME ZONE NULL,
  cancellation_reason TEXT NULL,
  
  -- Notes
  assignment_notes TEXT NULL,
  chef_notes TEXT NULL
);

-- Indexes for chefs
CREATE INDEX IF NOT EXISTS idx_chefs_email ON chefs(email);
CREATE INDEX IF NOT EXISTS idx_chefs_status ON chefs(status);
CREATE INDEX IF NOT EXISTS idx_chefs_stripe_account_id ON chefs(stripe_account_id);
CREATE INDEX IF NOT EXISTS idx_chefs_approved_at ON chefs(approved_at);

-- Indexes for chef_availability
CREATE INDEX IF NOT EXISTS idx_chef_availability_chef_id ON chef_availability(chef_id);
CREATE INDEX IF NOT EXISTS idx_chef_availability_date ON chef_availability(date);
CREATE INDEX IF NOT EXISTS idx_chef_availability_available ON chef_availability(available) WHERE available = TRUE;

-- Indexes for booking_assignments
CREATE INDEX IF NOT EXISTS idx_booking_assignments_booking_id ON booking_assignments(booking_id);
CREATE INDEX IF NOT EXISTS idx_booking_assignments_chef_id ON booking_assignments(chef_id);
CREATE INDEX IF NOT EXISTS idx_booking_assignments_status ON booking_assignments(status);
CREATE INDEX IF NOT EXISTS idx_booking_assignments_payout_status ON booking_assignments(payout_status);

-- Enable RLS
ALTER TABLE chefs ENABLE ROW LEVEL SECURITY;
ALTER TABLE chef_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_assignments ENABLE ROW LEVEL SECURITY;

-- RLS Policies (service role bypasses RLS, so these are for future authenticated access)
-- For now, all access is via service role on server-side

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_chefs_updated_at BEFORE UPDATE ON chefs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chef_availability_updated_at BEFORE UPDATE ON chef_availability
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Note: Chef status values:
-- 'pending' - Application submitted, awaiting admin review
-- 'approved' - Approved by admin, awaiting Stripe onboarding
-- 'rejected' - Application rejected
-- 'active' - Approved and Stripe onboarding complete, ready for assignments
-- 'inactive' - Temporarily inactive (can be reactivated)
