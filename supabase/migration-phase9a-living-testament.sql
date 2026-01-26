-- Phase 9A: The Living Testament
-- Public covenant, story, and commissioning engine for Bornfidis

-- living_testament table
CREATE TABLE IF NOT EXISTS living_testament (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  scripture TEXT NOT NULL, -- Scripture reference (e.g., "Matthew 28:19")
  scripture_text TEXT, -- Full scripture text
  testimony TEXT NOT NULL, -- The testimony/story
  region TEXT,
  author_name TEXT,
  author_role TEXT,
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  is_public BOOLEAN NOT NULL DEFAULT TRUE,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE living_testament ENABLE ROW LEVEL SECURITY;

-- RLS Policies for living_testament
CREATE POLICY "Public testimonies are viewable by everyone if is_public=true." ON living_testament
  FOR SELECT USING (is_public = TRUE);
CREATE POLICY "Authenticated users can view all testimonies." ON living_testament
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can insert testimonies." ON living_testament
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update testimonies." ON living_testament
  FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete testimonies." ON living_testament
  FOR DELETE USING (auth.role() = 'authenticated');

-- commissioned_leaders table
CREATE TABLE IF NOT EXISTS commissioned_leaders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  role TEXT NOT NULL, -- 'founder', 'elder', 'pastor', 'director', 'coordinator', 'mentor', 'chef', 'farmer'
  region TEXT NOT NULL,
  commissioned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  covenant_signed BOOLEAN NOT NULL DEFAULT FALSE,
  covenant_signed_at TIMESTAMP WITH TIME ZONE,
  commissioning_scripture TEXT, -- Scripture used for commissioning
  commissioning_notes TEXT,
  bio TEXT,
  photo_url TEXT,
  is_public BOOLEAN NOT NULL DEFAULT TRUE,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE commissioned_leaders ENABLE ROW LEVEL SECURITY;

-- RLS Policies for commissioned_leaders
CREATE POLICY "Public leaders are viewable by everyone if is_public=true." ON commissioned_leaders
  FOR SELECT USING (is_public = TRUE);
CREATE POLICY "Authenticated users can view all leaders." ON commissioned_leaders
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can insert leaders." ON commissioned_leaders
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update leaders." ON commissioned_leaders
  FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete leaders." ON commissioned_leaders
  FOR DELETE USING (auth.role() = 'authenticated');

-- Indexes
CREATE INDEX IF NOT EXISTS idx_living_testament_region ON living_testament(region);
CREATE INDEX IF NOT EXISTS idx_living_testament_is_public ON living_testament(is_public);
CREATE INDEX IF NOT EXISTS idx_living_testament_is_featured ON living_testament(is_featured);
CREATE INDEX IF NOT EXISTS idx_living_testament_display_order ON living_testament(display_order);
CREATE INDEX IF NOT EXISTS idx_commissioned_leaders_region ON commissioned_leaders(region);
CREATE INDEX IF NOT EXISTS idx_commissioned_leaders_role ON commissioned_leaders(role);
CREATE INDEX IF NOT EXISTS idx_commissioned_leaders_is_public ON commissioned_leaders(is_public);
CREATE INDEX IF NOT EXISTS idx_commissioned_leaders_covenant_signed ON commissioned_leaders(covenant_signed);
CREATE INDEX IF NOT EXISTS idx_commissioned_leaders_display_order ON commissioned_leaders(display_order);
CREATE INDEX IF NOT EXISTS idx_commissioned_leaders_commissioned_at ON commissioned_leaders(commissioned_at DESC);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_testament_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER trigger_living_testament_updated_at
  BEFORE UPDATE ON living_testament
  FOR EACH ROW
  EXECUTE FUNCTION update_testament_updated_at_column();

CREATE TRIGGER trigger_commissioned_leaders_updated_at
  BEFORE UPDATE ON commissioned_leaders
  FOR EACH ROW
  EXECUTE FUNCTION update_testament_updated_at_column();

-- Trigger to set covenant_signed_at when covenant_signed becomes true
CREATE OR REPLACE FUNCTION set_covenant_signed_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.covenant_signed = TRUE AND OLD.covenant_signed = FALSE THEN
    NEW.covenant_signed_at = NOW();
  ELSIF NEW.covenant_signed = FALSE THEN
    NEW.covenant_signed_at = NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_covenant_signed_at
  BEFORE UPDATE ON commissioned_leaders
  FOR EACH ROW
  EXECUTE FUNCTION set_covenant_signed_at();
