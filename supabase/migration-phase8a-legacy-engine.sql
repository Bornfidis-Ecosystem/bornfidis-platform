-- Phase 8A: Legacy & Succession Engine
-- Systems to ensure Bornfidis thrives for 100+ years

-- legacy_leaders table
CREATE TABLE IF NOT EXISTS legacy_leaders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  role TEXT NOT NULL, -- 'founder', 'elder', 'pastor', 'director', 'coordinator', 'mentor'
  region TEXT,
  bio TEXT,
  trained_at TIMESTAMP WITH TIME ZONE,
  ordained_at TIMESTAMP WITH TIME ZONE,
  succession_ready BOOLEAN NOT NULL DEFAULT FALSE,
  succession_notes TEXT,
  mentor_id UUID REFERENCES legacy_leaders(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'emeritus', 'training', 'ordained'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE legacy_leaders ENABLE ROW LEVEL SECURITY;

-- RLS Policies for legacy_leaders
CREATE POLICY "Public leaders are viewable by everyone." ON legacy_leaders
  FOR SELECT USING (TRUE);
CREATE POLICY "Authenticated users can insert leaders." ON legacy_leaders
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update leaders." ON legacy_leaders
  FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete leaders." ON legacy_leaders
  FOR DELETE USING (auth.role() = 'authenticated');

-- legacy_documents table
CREATE TABLE IF NOT EXISTS legacy_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT NOT NULL, -- 'vision', 'doctrine', 'operations', 'governance', 'finance', 'discipleship'
  content TEXT NOT NULL,
  summary TEXT,
  version TEXT NOT NULL DEFAULT '1.0',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  is_public BOOLEAN NOT NULL DEFAULT FALSE,
  author_id UUID REFERENCES legacy_leaders(id) ON DELETE SET NULL,
  approved_by UUID REFERENCES legacy_leaders(id) ON DELETE SET NULL,
  approved_at TIMESTAMP WITH TIME ZONE,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE legacy_documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies for legacy_documents
CREATE POLICY "Public documents are viewable by everyone if is_public=true." ON legacy_documents
  FOR SELECT USING (is_public = TRUE);
CREATE POLICY "Authenticated users can view all documents." ON legacy_documents
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can insert documents." ON legacy_documents
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update documents." ON legacy_documents
  FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete documents." ON legacy_documents
  FOR DELETE USING (auth.role() = 'authenticated');

-- prayer_requests table
CREATE TABLE IF NOT EXISTS prayer_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submitted_by TEXT NOT NULL,
  email TEXT,
  region TEXT,
  request TEXT NOT NULL,
  answered BOOLEAN NOT NULL DEFAULT FALSE,
  answer TEXT,
  answered_at TIMESTAMP WITH TIME ZONE,
  answered_by UUID REFERENCES legacy_leaders(id) ON DELETE SET NULL,
  is_public BOOLEAN NOT NULL DEFAULT TRUE,
  prayer_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE prayer_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for prayer_requests
CREATE POLICY "Public requests are viewable by everyone if is_public=true." ON prayer_requests
  FOR SELECT USING (is_public = TRUE);
CREATE POLICY "Authenticated users can view all requests." ON prayer_requests
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Anyone can insert prayer requests." ON prayer_requests
  FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Authenticated users can update requests." ON prayer_requests
  FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete requests." ON prayer_requests
  FOR DELETE USING (auth.role() = 'authenticated');

-- Indexes
CREATE INDEX IF NOT EXISTS idx_legacy_leaders_role ON legacy_leaders(role);
CREATE INDEX IF NOT EXISTS idx_legacy_leaders_region ON legacy_leaders(region);
CREATE INDEX IF NOT EXISTS idx_legacy_leaders_succession_ready ON legacy_leaders(succession_ready);
CREATE INDEX IF NOT EXISTS idx_legacy_leaders_status ON legacy_leaders(status);
CREATE INDEX IF NOT EXISTS idx_legacy_documents_category ON legacy_documents(category);
CREATE INDEX IF NOT EXISTS idx_legacy_documents_is_public ON legacy_documents(is_public);
CREATE INDEX IF NOT EXISTS idx_legacy_documents_is_active ON legacy_documents(is_active);
CREATE INDEX IF NOT EXISTS idx_prayer_requests_region ON prayer_requests(region);
CREATE INDEX IF NOT EXISTS idx_prayer_requests_answered ON prayer_requests(answered);
CREATE INDEX IF NOT EXISTS idx_prayer_requests_is_public ON prayer_requests(is_public);
CREATE INDEX IF NOT EXISTS idx_prayer_requests_created_at ON prayer_requests(created_at DESC);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_legacy_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER trigger_legacy_leaders_updated_at
  BEFORE UPDATE ON legacy_leaders
  FOR EACH ROW
  EXECUTE FUNCTION update_legacy_updated_at_column();

CREATE TRIGGER trigger_legacy_documents_updated_at
  BEFORE UPDATE ON legacy_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_legacy_updated_at_column();

CREATE TRIGGER trigger_prayer_requests_updated_at
  BEFORE UPDATE ON prayer_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_legacy_updated_at_column();
