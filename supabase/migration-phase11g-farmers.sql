-- Phase 11G: Portland Farmer Applications
-- Table for storing farmer join applications

CREATE TABLE IF NOT EXISTS farmers_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  acres NUMERIC NULL,
  crops TEXT NULL,
  status TEXT NOT NULL DEFAULT 'new', -- 'new', 'reviewed', 'approved', 'declined'
  notes TEXT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_farmers_applications_status ON farmers_applications(status);
CREATE INDEX IF NOT EXISTS idx_farmers_applications_created_at ON farmers_applications(created_at DESC);

-- Enable Row Level Security
ALTER TABLE farmers_applications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Public can insert (submit applications)
CREATE POLICY "Public can insert farmer applications" ON farmers_applications
  FOR INSERT
  TO public
  WITH CHECK (TRUE);

-- Authenticated users (admins) can read all
CREATE POLICY "Authenticated users can read farmer applications" ON farmers_applications
  FOR SELECT
  TO authenticated
  USING (TRUE);

-- Authenticated users (admins) can update
CREATE POLICY "Authenticated users can update farmer applications" ON farmers_applications
  FOR UPDATE
  TO authenticated
  USING (TRUE);

-- Authenticated users (admins) can delete
CREATE POLICY "Authenticated users can delete farmer applications" ON farmers_applications
  FOR DELETE
  TO authenticated
  USING (TRUE);

-- Public cannot read (privacy)
CREATE POLICY "Public cannot read farmer applications" ON farmers_applications
  FOR SELECT
  TO public
  USING (FALSE);

-- Public cannot update or delete
CREATE POLICY "Public cannot update farmer applications" ON farmers_applications
  FOR UPDATE
  TO public
  USING (FALSE);

CREATE POLICY "Public cannot delete farmer applications" ON farmers_applications
  FOR DELETE
  TO public
  USING (FALSE);
