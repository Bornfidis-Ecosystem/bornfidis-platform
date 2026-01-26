-- Phase 7B: Bornfidis Global Replication Engine
-- Create a franchise + cooperative hybrid for launching regenerative hubs globally

-- Replication regions table (regions applying to replicate the model)
CREATE TABLE IF NOT EXISTS replication_regions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  
  -- Region identification
  name TEXT NOT NULL, -- e.g., "Bornfidis Kingston", "Bornfidis Montego Bay"
  country TEXT NOT NULL,
  city TEXT,
  region_description TEXT, -- Description of the region/community
  
  -- Leadership
  leader_name TEXT NOT NULL,
  leader_email TEXT UNIQUE NOT NULL,
  leader_phone TEXT,
  leader_bio TEXT,
  leader_experience TEXT, -- Relevant experience
  
  -- Status tracking
  status TEXT NOT NULL DEFAULT 'inquiry', -- 'inquiry' | 'approved' | 'launching' | 'active'
  inquiry_submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  approved_at TIMESTAMP WITH TIME ZONE NULL,
  approved_by UUID NULL, -- Admin user ID
  launch_date DATE NULL, -- Target or actual launch date
  launched_at TIMESTAMP WITH TIME ZONE NULL, -- Actual launch timestamp
  
  -- Impact goals
  impact_goal TEXT, -- Regional impact goals and vision
  target_communities TEXT[], -- Target communities to serve
  expected_farmers INTEGER DEFAULT 0, -- Expected number of farmers
  expected_chefs INTEGER DEFAULT 0, -- Expected number of chefs
  
  -- Resources and support
  capital_needed_cents INTEGER DEFAULT 0, -- Capital needed for launch
  capital_raised_cents INTEGER DEFAULT 0, -- Capital raised so far
  support_needed TEXT[], -- Types of support needed
  
  -- Links
  website_url TEXT,
  social_media JSONB NULL, -- Social media links
  
  -- Admin notes
  admin_notes TEXT,
  rejection_reason TEXT,
  
  -- Metadata
  metadata JSONB NULL
);

-- Replication kits table (knowledge/content kits for launching hubs)
CREATE TABLE IF NOT EXISTS replication_kits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  
  -- Kit classification
  region_id UUID NULL REFERENCES replication_regions(id) ON DELETE SET NULL, -- Optional: region-specific kit
  kit_type TEXT NOT NULL, -- 'chef' | 'farm' | 'market' | 'housing' | 'education'
  version TEXT NOT NULL DEFAULT '1.0', -- Kit version (e.g., '1.0', '2.1')
  
  -- Content
  title TEXT NOT NULL,
  description TEXT,
  content TEXT NOT NULL, -- Markdown or HTML content
  resources JSONB NULL, -- Additional resources (PDFs, videos, links)
  
  -- Requirements
  required_for_launch BOOLEAN DEFAULT FALSE NOT NULL, -- Required kit for launching
  prerequisites TEXT[], -- Array of prerequisite kit IDs
  
  -- Ordering
  sort_order INTEGER DEFAULT 0 NOT NULL,
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  is_public BOOLEAN DEFAULT FALSE NOT NULL, -- Public kits visible to all regions
  
  -- Metadata
  estimated_completion_days INTEGER, -- Estimated days to complete
  difficulty_level TEXT, -- 'beginner' | 'intermediate' | 'advanced'
  tags TEXT[]
);

-- Impact investors table (investors interested in funding replication)
CREATE TABLE IF NOT EXISTS impact_investors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  
  -- Investor info
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  organization TEXT, -- Organization name if applicable
  
  -- Investment interest
  region_interest TEXT[], -- Regions of interest
  capital_committed_cents INTEGER DEFAULT 0 NOT NULL, -- Committed capital in cents
  capital_paid_cents INTEGER DEFAULT 0 NOT NULL, -- Capital actually paid
  investment_type TEXT, -- 'grant' | 'loan' | 'equity' | 'donation'
  
  -- Status
  status TEXT NOT NULL DEFAULT 'inquiry', -- 'inquiry' | 'committed' | 'paid' | 'active'
  committed_at TIMESTAMP WITH TIME ZONE NULL,
  paid_at TIMESTAMP WITH TIME ZONE NULL,
  
  -- Terms
  terms_notes TEXT, -- Investment terms and conditions
  expected_return TEXT, -- Expected return (for loans/equity)
  
  -- Links
  website_url TEXT,
  linkedin_url TEXT,
  
  -- Admin notes
  admin_notes TEXT,
  
  -- Metadata
  metadata JSONB NULL
);

-- Region kit completion tracking
CREATE TABLE IF NOT EXISTS replication_region_kits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  
  region_id UUID NOT NULL REFERENCES replication_regions(id) ON DELETE CASCADE,
  kit_id UUID NOT NULL REFERENCES replication_kits(id) ON DELETE CASCADE,
  
  status TEXT NOT NULL DEFAULT 'not_started', -- 'not_started' | 'in_progress' | 'completed'
  started_at TIMESTAMP WITH TIME ZONE NULL,
  completed_at TIMESTAMP WITH TIME ZONE NULL,
  
  notes TEXT NULL,
  
  UNIQUE(region_id, kit_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_replication_regions_country ON replication_regions(country);
CREATE INDEX IF NOT EXISTS idx_replication_regions_status ON replication_regions(status);
CREATE INDEX IF NOT EXISTS idx_replication_regions_leader_email ON replication_regions(leader_email);
CREATE INDEX IF NOT EXISTS idx_replication_regions_approved_at ON replication_regions(approved_at);
CREATE INDEX IF NOT EXISTS idx_replication_regions_launch_date ON replication_regions(launch_date);

CREATE INDEX IF NOT EXISTS idx_replication_kits_region_id ON replication_kits(region_id);
CREATE INDEX IF NOT EXISTS idx_replication_kits_type ON replication_kits(kit_type);
CREATE INDEX IF NOT EXISTS idx_replication_kits_active ON replication_kits(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_replication_kits_public ON replication_kits(is_public) WHERE is_public = TRUE;
CREATE INDEX IF NOT EXISTS idx_replication_kits_sort_order ON replication_kits(sort_order);

CREATE INDEX IF NOT EXISTS idx_impact_investors_email ON impact_investors(email);
CREATE INDEX IF NOT EXISTS idx_impact_investors_status ON impact_investors(status);
CREATE INDEX IF NOT EXISTS idx_impact_investors_region_interest ON impact_investors USING GIN(region_interest);

CREATE INDEX IF NOT EXISTS idx_replication_region_kits_region_id ON replication_region_kits(region_id);
CREATE INDEX IF NOT EXISTS idx_replication_region_kits_kit_id ON replication_region_kits(kit_id);
CREATE INDEX IF NOT EXISTS idx_replication_region_kits_status ON replication_region_kits(status);

-- Enable RLS
ALTER TABLE replication_regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE replication_kits ENABLE ROW LEVEL SECURITY;
ALTER TABLE impact_investors ENABLE ROW LEVEL SECURITY;
ALTER TABLE replication_region_kits ENABLE ROW LEVEL SECURITY;

-- Update trigger for updated_at
CREATE TRIGGER update_replication_regions_updated_at BEFORE UPDATE ON replication_regions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_replication_kits_updated_at BEFORE UPDATE ON replication_kits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_impact_investors_updated_at BEFORE UPDATE ON impact_investors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_replication_region_kits_updated_at BEFORE UPDATE ON replication_region_kits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Note: replication_regions.status values:
-- 'inquiry' - Initial inquiry submitted
-- 'approved' - Approved to proceed with launch planning
-- 'launching' - In active launch phase
-- 'active' - Successfully launched and operational

-- Note: replication_kits.kit_type values:
-- 'chef' - Chef network and training
-- 'farm' - Farmer network and regenerative agriculture
-- 'market' - Market development and sales
-- 'housing' - Housing and community infrastructure
-- 'education' - Education and training programs

-- Note: impact_investors.status values:
-- 'inquiry' - Initial inquiry
-- 'committed' - Capital committed but not yet paid
-- 'paid' - Capital paid
-- 'active' - Active investor relationship

-- Note: replication_region_kits.status values:
-- 'not_started' - Kit not yet started
-- 'in_progress' - Kit in progress
-- 'completed' - Kit completed
