-- Phase 7A: Bornfidis Global Regenerative Cooperative Engine
-- Build a cooperative platform to onboard, govern, and distribute wealth

-- Cooperative members table
CREATE TABLE IF NOT EXISTS cooperative_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  
  -- Basic info
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  
  -- Cooperative classification
  role TEXT NOT NULL, -- 'farmer' | 'chef' | 'educator' | 'builder' | 'partner'
  region TEXT NOT NULL, -- e.g., 'Jamaica', 'Caribbean', 'Global'
  
  -- Membership
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending' | 'active' | 'inactive' | 'suspended'
  approved_at TIMESTAMP WITH TIME ZONE NULL,
  approved_by UUID NULL, -- Admin user ID
  
  -- Impact and payout
  impact_score INTEGER DEFAULT 0 NOT NULL, -- Calculated monthly (0-1000 scale)
  payout_share_percent NUMERIC(5,2) DEFAULT 0.00 NOT NULL, -- Percentage of cooperative profits (0-100)
  
  -- Links to existing entities
  farmer_id UUID NULL REFERENCES farmers(id) ON DELETE SET NULL,
  chef_id UUID NULL REFERENCES chefs(id) ON DELETE SET NULL,
  
  -- Profile
  bio TEXT,
  profile_image_url TEXT,
  website_url TEXT,
  instagram_handle TEXT,
  
  -- Admin notes
  admin_notes TEXT,
  
  -- Metadata
  metadata JSONB NULL
);

-- Cooperative payouts table (historical payout records)
CREATE TABLE IF NOT EXISTS cooperative_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  
  -- Payout details
  member_id UUID NOT NULL REFERENCES cooperative_members(id) ON DELETE CASCADE,
  period TEXT NOT NULL, -- '2024-01', '2024-Q1', '2024', etc.
  period_type TEXT NOT NULL DEFAULT 'monthly', -- 'monthly' | 'quarterly' | 'annual'
  
  -- Payout calculation
  amount_cents INTEGER NOT NULL, -- Payout amount in cents
  impact_score INTEGER NOT NULL, -- Impact score at time of payout
  payout_share_percent NUMERIC(5,2) NOT NULL, -- Share percentage at time of payout
  total_cooperative_profit_cents INTEGER NOT NULL, -- Total profit distributed this period
  
  -- Payment tracking
  payout_status TEXT NOT NULL DEFAULT 'pending', -- 'pending' | 'paid' | 'failed'
  stripe_transfer_id TEXT NULL,
  paid_at TIMESTAMP WITH TIME ZONE NULL,
  
  -- Notes
  notes TEXT NULL
);

-- Cooperative training table
CREATE TABLE IF NOT EXISTS cooperative_training (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  
  -- Training details
  title TEXT NOT NULL,
  track TEXT NOT NULL, -- 'food' | 'soil' | 'faith' | 'enterprise'
  content TEXT NOT NULL, -- Markdown or HTML content
  description TEXT, -- Short description
  
  -- Requirements
  required BOOLEAN DEFAULT FALSE NOT NULL, -- Required for all members
  required_for_roles TEXT[], -- Array of roles that must complete this
  
  -- Ordering
  sort_order INTEGER DEFAULT 0 NOT NULL,
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  
  -- Metadata
  estimated_duration_minutes INTEGER, -- Estimated completion time
  video_url TEXT, -- Optional video link
  resources JSONB NULL -- Additional resources (PDFs, links, etc.)
);

-- Member training completion tracking
CREATE TABLE IF NOT EXISTS cooperative_member_training (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  
  member_id UUID NOT NULL REFERENCES cooperative_members(id) ON DELETE CASCADE,
  training_id UUID NOT NULL REFERENCES cooperative_training(id) ON DELETE CASCADE,
  
  completed_at TIMESTAMP WITH TIME ZONE NULL,
  score INTEGER NULL, -- Optional quiz/assessment score (0-100)
  notes TEXT NULL,
  
  UNIQUE(member_id, training_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_cooperative_members_email ON cooperative_members(email);
CREATE INDEX IF NOT EXISTS idx_cooperative_members_role ON cooperative_members(role);
CREATE INDEX IF NOT EXISTS idx_cooperative_members_region ON cooperative_members(region);
CREATE INDEX IF NOT EXISTS idx_cooperative_members_status ON cooperative_members(status);
CREATE INDEX IF NOT EXISTS idx_cooperative_members_impact_score ON cooperative_members(impact_score DESC);
CREATE INDEX IF NOT EXISTS idx_cooperative_members_farmer_id ON cooperative_members(farmer_id);
CREATE INDEX IF NOT EXISTS idx_cooperative_members_chef_id ON cooperative_members(chef_id);

CREATE INDEX IF NOT EXISTS idx_cooperative_payouts_member_id ON cooperative_payouts(member_id);
CREATE INDEX IF NOT EXISTS idx_cooperative_payouts_period ON cooperative_payouts(period);
CREATE INDEX IF NOT EXISTS idx_cooperative_payouts_period_type ON cooperative_payouts(period_type);
CREATE INDEX IF NOT EXISTS idx_cooperative_payouts_status ON cooperative_payouts(payout_status);
CREATE INDEX IF NOT EXISTS idx_cooperative_payouts_created_at ON cooperative_payouts(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_cooperative_training_track ON cooperative_training(track);
CREATE INDEX IF NOT EXISTS idx_cooperative_training_required ON cooperative_training(required);
CREATE INDEX IF NOT EXISTS idx_cooperative_training_active ON cooperative_training(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_cooperative_training_sort_order ON cooperative_training(sort_order);

CREATE INDEX IF NOT EXISTS idx_cooperative_member_training_member_id ON cooperative_member_training(member_id);
CREATE INDEX IF NOT EXISTS idx_cooperative_member_training_training_id ON cooperative_member_training(training_id);
CREATE INDEX IF NOT EXISTS idx_cooperative_member_training_completed ON cooperative_member_training(completed_at) WHERE completed_at IS NOT NULL;

-- Enable RLS
ALTER TABLE cooperative_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE cooperative_payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cooperative_training ENABLE ROW LEVEL SECURITY;
ALTER TABLE cooperative_member_training ENABLE ROW LEVEL SECURITY;

-- Update trigger for updated_at
CREATE TRIGGER update_cooperative_members_updated_at BEFORE UPDATE ON cooperative_members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cooperative_training_updated_at BEFORE UPDATE ON cooperative_training
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Note: cooperative_members.role values:
-- 'farmer' - Regenerative farmers
-- 'chef' - Skilled chefs
-- 'educator' - Training and education providers
-- 'builder' - Infrastructure and development partners
-- 'partner' - Strategic partners and supporters

-- Note: cooperative_members.status values:
-- 'pending' - Application submitted, awaiting approval
-- 'active' - Active member
-- 'inactive' - Temporarily inactive
-- 'suspended' - Suspended from cooperative

-- Note: cooperative_training.track values:
-- 'food' - Food preparation, nutrition, culinary skills
-- 'soil' - Regenerative agriculture, soil health
-- 'faith' - Faith-based business practices, values
-- 'enterprise' - Business skills, entrepreneurship

-- Note: cooperative_payouts.period format:
-- Monthly: '2024-01', '2024-02', etc.
-- Quarterly: '2024-Q1', '2024-Q2', etc.
-- Annual: '2024', '2025', etc.
