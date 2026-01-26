-- Phase 11G.2: WhatsApp + Voice-first Farmer Intake
-- Adds support for WhatsApp intake with voice note transcription

-- Create farmer_intakes table to track WhatsApp messages
CREATE TABLE IF NOT EXISTS farmer_intakes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now() NOT NULL,
  channel text NOT NULL DEFAULT 'whatsapp',
  from_phone text NOT NULL,
  message_text text,
  media_url text,
  media_content_type text,
  transcript text,
  extracted_json jsonb,
  farmer_id uuid REFERENCES farmers_applications(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'received', -- received|transcribed|saved|failed
  error text,
  CONSTRAINT farmer_intakes_status_check CHECK (status IN ('received', 'transcribed', 'saved', 'failed'))
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_farmer_intakes_farmer_id ON farmer_intakes(farmer_id);
CREATE INDEX IF NOT EXISTS idx_farmer_intakes_status ON farmer_intakes(status);
CREATE INDEX IF NOT EXISTS idx_farmer_intakes_created_at ON farmer_intakes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_farmer_intakes_from_phone ON farmer_intakes(from_phone);

-- Add optional columns to farmers_applications table
ALTER TABLE farmers_applications
  ADD COLUMN IF NOT EXISTS transcript text,
  ADD COLUMN IF NOT EXISTS intake_channel text,
  ADD COLUMN IF NOT EXISTS intake_source text;

-- Add constraint for intake_channel (drop first if exists)
ALTER TABLE farmers_applications
  DROP CONSTRAINT IF EXISTS farmers_applications_intake_channel_check;
  
ALTER TABLE farmers_applications
  ADD CONSTRAINT farmers_applications_intake_channel_check 
  CHECK (intake_channel IS NULL OR intake_channel IN ('web', 'whatsapp'));

-- Enable RLS
ALTER TABLE farmer_intakes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for farmer_intakes
-- Drop existing policies if they exist (idempotent)
DROP POLICY IF EXISTS "Public can insert farmer intakes" ON farmer_intakes;
DROP POLICY IF EXISTS "Admins can read farmer intakes" ON farmer_intakes;
DROP POLICY IF EXISTS "Service role can manage farmer intakes" ON farmer_intakes;

-- Public can insert (for webhook)
CREATE POLICY "Public can insert farmer intakes" ON farmer_intakes
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Authenticated users (admins) can read
CREATE POLICY "Admins can read farmer intakes" ON farmer_intakes
  FOR SELECT
  TO authenticated
  USING (auth.role() = 'authenticated');

-- Service role can do everything (for API routes)
CREATE POLICY "Service role can manage farmer intakes" ON farmer_intakes
  FOR ALL
  TO service_role
  USING (true);

-- Comments
COMMENT ON TABLE farmer_intakes IS 'Tracks WhatsApp and other channel intakes for farmer applications';
COMMENT ON COLUMN farmer_intakes.channel IS 'Channel type: whatsapp, sms, etc.';
COMMENT ON COLUMN farmer_intakes.status IS 'Processing status: received, transcribed, saved, failed';
COMMENT ON COLUMN farmer_intakes.extracted_json IS 'JSON object with extracted fields (name, parish, acres, crops)';
COMMENT ON COLUMN farmers_applications.transcript IS 'Voice note transcript if intake was via voice';
COMMENT ON COLUMN farmers_applications.intake_channel IS 'Channel used for intake: web, whatsapp';
COMMENT ON COLUMN farmers_applications.intake_source IS 'Source type: voice, text';
