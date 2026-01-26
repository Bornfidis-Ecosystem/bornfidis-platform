-- Phase 10B: Launch & Storytelling Engine
-- Public launch system with story, testimony, and momentum

-- stories table (extends living_testament for public submissions)
CREATE TABLE IF NOT EXISTS stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  author_name TEXT NOT NULL,
  author_email TEXT,
  author_role TEXT,
  author_region TEXT,
  story_text TEXT NOT NULL,
  video_url TEXT, -- YouTube, Vimeo, or other video embed URL
  image_url TEXT,
  category TEXT NOT NULL DEFAULT 'testimony', -- 'testimony', 'impact', 'farmer', 'chef', 'community', 'partner'
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  is_approved BOOLEAN NOT NULL DEFAULT FALSE,
  is_public BOOLEAN NOT NULL DEFAULT FALSE,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  approved_at TIMESTAMP WITH TIME ZONE,
  approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE stories ENABLE ROW LEVEL SECURITY;

-- RLS Policies for stories
CREATE POLICY "Public stories are viewable by everyone if is_public=true and is_approved=true." ON stories
  FOR SELECT USING (is_public = TRUE AND is_approved = TRUE);
CREATE POLICY "Anyone can insert stories." ON stories
  FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Authenticated users can view all stories." ON stories
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update stories." ON stories
  FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete stories." ON stories
  FOR DELETE USING (auth.role() = 'authenticated');

-- press_kit table
CREATE TABLE IF NOT EXISTS press_kit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL, -- URL to press kit PDF or document
  file_type TEXT NOT NULL DEFAULT 'pdf', -- 'pdf', 'zip', 'doc'
  file_size_bytes INTEGER,
  version TEXT NOT NULL DEFAULT '1.0',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  download_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE press_kit ENABLE ROW LEVEL SECURITY;

-- RLS Policies for press_kit
CREATE POLICY "Public press kits are viewable by everyone if is_active=true." ON press_kit
  FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Authenticated users can insert press kits." ON press_kit
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update press kits." ON press_kit
  FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete press kits." ON press_kit
  FOR DELETE USING (auth.role() = 'authenticated');

-- partner_inquiries table
CREATE TABLE IF NOT EXISTS partner_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  organization_type TEXT, -- 'media', 'nonprofit', 'business', 'church', 'government', 'other'
  partnership_interest TEXT, -- 'sponsorship', 'collaboration', 'media', 'distribution', 'other'
  message TEXT NOT NULL,
  website_url TEXT,
  status TEXT NOT NULL DEFAULT 'submitted', -- 'submitted', 'reviewed', 'contacted', 'partnered', 'declined'
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE partner_inquiries ENABLE ROW LEVEL SECURITY;

-- RLS Policies for partner_inquiries
CREATE POLICY "Public inquiries can insert." ON partner_inquiries
  FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Authenticated users can view all inquiries." ON partner_inquiries
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update inquiries." ON partner_inquiries
  FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete inquiries." ON partner_inquiries
  FOR DELETE USING (auth.role() = 'authenticated');

-- Indexes
CREATE INDEX IF NOT EXISTS idx_stories_category ON stories(category);
CREATE INDEX IF NOT EXISTS idx_stories_is_approved ON stories(is_approved);
CREATE INDEX IF NOT EXISTS idx_stories_is_public ON stories(is_public);
CREATE INDEX IF NOT EXISTS idx_stories_is_featured ON stories(is_featured);
CREATE INDEX IF NOT EXISTS idx_stories_display_order ON stories(display_order);
CREATE INDEX IF NOT EXISTS idx_stories_submitted_at ON stories(submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_press_kit_is_active ON press_kit(is_active);
CREATE INDEX IF NOT EXISTS idx_partner_inquiries_status ON partner_inquiries(status);
CREATE INDEX IF NOT EXISTS idx_partner_inquiries_created_at ON partner_inquiries(created_at DESC);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_launch_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER trigger_stories_updated_at
  BEFORE UPDATE ON stories
  FOR EACH ROW
  EXECUTE FUNCTION update_launch_updated_at_column();

CREATE TRIGGER trigger_press_kit_updated_at
  BEFORE UPDATE ON press_kit
  FOR EACH ROW
  EXECUTE FUNCTION update_launch_updated_at_column();

CREATE TRIGGER trigger_partner_inquiries_updated_at
  BEFORE UPDATE ON partner_inquiries
  FOR EACH ROW
  EXECUTE FUNCTION update_launch_updated_at_column();

-- Trigger to set approved_at when story is approved
CREATE OR REPLACE FUNCTION set_story_approved_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_approved = TRUE AND OLD.is_approved = FALSE THEN
    NEW.approved_at = NOW();
  ELSIF NEW.is_approved = FALSE THEN
    NEW.approved_at = NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_story_approved_at
  BEFORE UPDATE ON stories
  FOR EACH ROW
  EXECUTE FUNCTION set_story_approved_at();

-- Note: Download count is incremented via API route, not trigger
-- This allows for better tracking and control
