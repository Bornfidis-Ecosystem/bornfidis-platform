-- Phase 6C: Regenerative Impact Ledger (Bornfidis Impact Engine)
-- Track spiritual, ecological, and economic impact across the ecosystem

-- Impact events table (individual impact records)
CREATE TABLE IF NOT EXISTS impact_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  
  -- Event classification
  type TEXT NOT NULL, -- 'soil' | 'farmer' | 'chef' | 'guest' | 'community'
  reference_id UUID NULL, -- Links to farmer_id, chef_id, booking_id, etc.
  booking_id UUID NULL REFERENCES booking_inquiries(id) ON DELETE SET NULL,
  
  -- Impact measurement
  metric TEXT NOT NULL, -- e.g., 'soil_health_points', 'income_cents', 'meals_served', 'families_supported'
  value NUMERIC NOT NULL, -- The impact value
  unit TEXT NOT NULL, -- e.g., 'points', 'cents', 'meals', 'families', 'dollars'
  
  -- Context
  description TEXT NULL, -- Human-readable description
  metadata JSONB NULL -- Additional context (farmer name, ingredient details, etc.)
);

-- Impact snapshots table (periodic aggregate metrics)
CREATE TABLE IF NOT EXISTS impact_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  
  -- Period classification
  period TEXT NOT NULL, -- 'daily' | 'monthly' | 'annual'
  period_start DATE NOT NULL, -- Start date of the period
  period_end DATE NOT NULL, -- End date of the period
  
  -- Aggregate metrics
  soil_score INTEGER DEFAULT 0 NOT NULL, -- Average regenerative score
  farmer_income_cents INTEGER DEFAULT 0 NOT NULL, -- Total farmer income
  chef_income_cents INTEGER DEFAULT 0 NOT NULL, -- Total chef income
  meals_served INTEGER DEFAULT 0 NOT NULL, -- Total meals served
  chefs_active INTEGER DEFAULT 0 NOT NULL, -- Active chefs in period
  farmers_active INTEGER DEFAULT 0 NOT NULL, -- Active farmers in period
  families_supported INTEGER DEFAULT 0 NOT NULL, -- Families supported
  scholarships_funded INTEGER DEFAULT 0 NOT NULL, -- Scholarships funded
  bookings_completed INTEGER DEFAULT 0 NOT NULL, -- Completed bookings
  
  -- Additional metrics
  ingredients_sourced INTEGER DEFAULT 0 NOT NULL, -- Ingredients sourced
  regenerative_practices_count INTEGER DEFAULT 0 NOT NULL, -- Count of regenerative practices
  
  -- Metadata
  notes TEXT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_impact_events_type ON impact_events(type);
CREATE INDEX IF NOT EXISTS idx_impact_events_booking_id ON impact_events(booking_id);
CREATE INDEX IF NOT EXISTS idx_impact_events_reference_id ON impact_events(reference_id);
CREATE INDEX IF NOT EXISTS idx_impact_events_created_at ON impact_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_impact_events_metric ON impact_events(metric);

CREATE INDEX IF NOT EXISTS idx_impact_snapshots_period ON impact_snapshots(period);
CREATE INDEX IF NOT EXISTS idx_impact_snapshots_period_start ON impact_snapshots(period_start DESC);
CREATE INDEX IF NOT EXISTS idx_impact_snapshots_period_end ON impact_snapshots(period_end DESC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_impact_snapshots_period_unique ON impact_snapshots(period, period_start);

-- Enable RLS
ALTER TABLE impact_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE impact_snapshots ENABLE ROW LEVEL SECURITY;

-- Note: impact_events.type values:
-- 'soil' - Soil health and regenerative agriculture impact
-- 'farmer' - Farmer income and economic impact
-- 'chef' - Chef income and professional development
-- 'guest' - Guest/community member impact
-- 'community' - Community-wide impact (meals, scholarships, etc.)

-- Note: impact_events.metric examples:
-- 'soil_health_points' - Regenerative score contribution
-- 'income_cents' - Income generated
-- 'meals_served' - Number of meals
-- 'families_supported' - Families impacted
-- 'scholarships_funded' - Educational support
-- 'ingredients_sourced' - Local sourcing count

-- Note: impact_snapshots.period values:
-- 'daily' - Daily aggregate
-- 'monthly' - Monthly aggregate
-- 'annual' - Annual aggregate
