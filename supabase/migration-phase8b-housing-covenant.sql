-- Phase 8B: Generational Wealth & Housing Covenant
-- Faith-aligned housing and inheritance engine for Bornfidis communities

-- housing_projects table
CREATE TABLE IF NOT EXISTS housing_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  region TEXT NOT NULL,
  location_address TEXT,
  units_total INTEGER NOT NULL DEFAULT 0,
  units_occupied INTEGER NOT NULL DEFAULT 0,
  units_available INTEGER NOT NULL DEFAULT 0,
  land_owner TEXT,
  land_ownership_type TEXT DEFAULT 'community', -- 'community', 'trust', 'cooperative', 'individual'
  trust_established BOOLEAN NOT NULL DEFAULT FALSE,
  trust_name TEXT,
  trust_established_date DATE,
  project_status TEXT NOT NULL DEFAULT 'planning', -- 'planning', 'development', 'construction', 'active', 'completed'
  description TEXT,
  vision TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE housing_projects ENABLE ROW LEVEL SECURITY;

-- RLS Policies for housing_projects
CREATE POLICY "Public projects are viewable by everyone." ON housing_projects
  FOR SELECT USING (TRUE);
CREATE POLICY "Authenticated users can insert projects." ON housing_projects
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update projects." ON housing_projects
  FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete projects." ON housing_projects
  FOR DELETE USING (auth.role() = 'authenticated');

-- housing_residents table
CREATE TABLE IF NOT EXISTS housing_residents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  family_size INTEGER NOT NULL DEFAULT 1,
  project_id UUID REFERENCES housing_projects(id) ON DELETE CASCADE,
  equity_cents INTEGER NOT NULL DEFAULT 0,
  rent_cents INTEGER NOT NULL DEFAULT 0,
  monthly_payment_cents INTEGER NOT NULL DEFAULT 0,
  own_by_date DATE,
  move_in_date DATE,
  status TEXT NOT NULL DEFAULT 'applied', -- 'applied', 'approved', 'active', 'owner', 'moved_out'
  application_date DATE DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE housing_residents ENABLE ROW LEVEL SECURITY;

-- RLS Policies for housing_residents
CREATE POLICY "Public residents are viewable by everyone if status='active' or 'owner'." ON housing_residents
  FOR SELECT USING (status IN ('active', 'owner'));
CREATE POLICY "Anyone can insert resident applications." ON housing_residents
  FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Authenticated users can view all residents." ON housing_residents
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update residents." ON housing_residents
  FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete residents." ON housing_residents
  FOR DELETE USING (auth.role() = 'authenticated');

-- legacy_funds table
CREATE TABLE IF NOT EXISTS legacy_funds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_name TEXT NOT NULL,
  region TEXT,
  balance_cents INTEGER NOT NULL DEFAULT 0,
  purpose TEXT NOT NULL, -- 'housing', 'education', 'land', 'business', 'emergency'
  fund_type TEXT NOT NULL DEFAULT 'savings', -- 'savings', 'trust', 'inheritance', 'scholarship'
  target_balance_cents INTEGER,
  description TEXT,
  beneficiary_name TEXT,
  beneficiary_relationship TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE legacy_funds ENABLE ROW LEVEL SECURITY;

-- RLS Policies for legacy_funds
CREATE POLICY "Public funds are viewable by everyone." ON legacy_funds
  FOR SELECT USING (TRUE);
CREATE POLICY "Authenticated users can insert funds." ON legacy_funds
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update funds." ON legacy_funds
  FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete funds." ON legacy_funds
  FOR DELETE USING (auth.role() = 'authenticated');

-- Indexes
CREATE INDEX IF NOT EXISTS idx_housing_projects_region ON housing_projects(region);
CREATE INDEX IF NOT EXISTS idx_housing_projects_status ON housing_projects(project_status);
CREATE INDEX IF NOT EXISTS idx_housing_residents_project_id ON housing_residents(project_id);
CREATE INDEX IF NOT EXISTS idx_housing_residents_status ON housing_residents(status);
CREATE INDEX IF NOT EXISTS idx_housing_residents_email ON housing_residents(email);
CREATE INDEX IF NOT EXISTS idx_legacy_funds_family_name ON legacy_funds(family_name);
CREATE INDEX IF NOT EXISTS idx_legacy_funds_region ON legacy_funds(region);
CREATE INDEX IF NOT EXISTS idx_legacy_funds_purpose ON legacy_funds(purpose);
CREATE INDEX IF NOT EXISTS idx_legacy_funds_is_active ON legacy_funds(is_active);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_housing_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER trigger_housing_projects_updated_at
  BEFORE UPDATE ON housing_projects
  FOR EACH ROW
  EXECUTE FUNCTION update_housing_updated_at_column();

CREATE TRIGGER trigger_housing_residents_updated_at
  BEFORE UPDATE ON housing_residents
  FOR EACH ROW
  EXECUTE FUNCTION update_housing_updated_at_column();

CREATE TRIGGER trigger_legacy_funds_updated_at
  BEFORE UPDATE ON legacy_funds
  FOR EACH ROW
  EXECUTE FUNCTION update_housing_updated_at_column();

-- Function to update project unit counts
CREATE OR REPLACE FUNCTION update_housing_project_units()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE housing_projects
    SET units_occupied = units_occupied + 1,
        units_available = units_available - 1,
        updated_at = NOW()
    WHERE id = NEW.project_id;
  ELSIF TG_OP = 'UPDATE' THEN
    -- If status changed to active/owner, increment occupied
    IF NEW.status IN ('active', 'owner') AND OLD.status NOT IN ('active', 'owner') THEN
      UPDATE housing_projects
      SET units_occupied = units_occupied + 1,
          units_available = units_available - 1,
          updated_at = NOW()
      WHERE id = NEW.project_id;
    -- If status changed from active/owner, decrement occupied
    ELSIF OLD.status IN ('active', 'owner') AND NEW.status NOT IN ('active', 'owner') THEN
      UPDATE housing_projects
      SET units_occupied = units_occupied - 1,
          units_available = units_available + 1,
          updated_at = NOW()
      WHERE id = NEW.project_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.status IN ('active', 'owner') THEN
      UPDATE housing_projects
      SET units_occupied = units_occupied - 1,
          units_available = units_available + 1,
          updated_at = NOW()
      WHERE id = OLD.project_id;
    END IF;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update project unit counts
CREATE TRIGGER trigger_update_housing_project_units
  AFTER INSERT OR UPDATE OR DELETE ON housing_residents
  FOR EACH ROW
  EXECUTE FUNCTION update_housing_project_units();
