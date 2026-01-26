-- Phase 11G.2: Voice Coordinator Engine
-- Table for tracking farmer calls and outcomes

CREATE TABLE IF NOT EXISTS farmer_call_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  farmer_id UUID NOT NULL REFERENCES farmers_applications(id) ON DELETE CASCADE,
  coordinator_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  call_sid TEXT, -- Twilio Call SID
  call_status TEXT, -- 'initiated', 'ringing', 'in-progress', 'completed', 'failed', 'no-answer', 'busy'
  call_duration_seconds INTEGER,
  interest_level TEXT, -- 'high', 'medium', 'low', 'not_interested'
  crops_confirmed TEXT,
  volume_estimate TEXT,
  preferred_contact_time TEXT,
  notes TEXT,
  call_outcome TEXT, -- 'connected', 'no_answer', 'busy', 'failed', 'voicemail'
  follow_up_sms_sent BOOLEAN NOT NULL DEFAULT FALSE,
  follow_up_sms_sid TEXT,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_farmer_call_logs_farmer_id ON farmer_call_logs(farmer_id);
CREATE INDEX IF NOT EXISTS idx_farmer_call_logs_coordinator_id ON farmer_call_logs(coordinator_id);
CREATE INDEX IF NOT EXISTS idx_farmer_call_logs_call_status ON farmer_call_logs(call_status);
CREATE INDEX IF NOT EXISTS idx_farmer_call_logs_created_at ON farmer_call_logs(created_at DESC);

-- Enable Row Level Security
ALTER TABLE farmer_call_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Authenticated users (coordinators/admins) can read all call logs
CREATE POLICY "Authenticated users can read call logs" ON farmer_call_logs
  FOR SELECT
  TO authenticated
  USING (TRUE);

-- Authenticated users can insert call logs
CREATE POLICY "Authenticated users can insert call logs" ON farmer_call_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (TRUE);

-- Authenticated users can update call logs
CREATE POLICY "Authenticated users can update call logs" ON farmer_call_logs
  FOR UPDATE
  TO authenticated
  USING (TRUE);

-- Public cannot access call logs
CREATE POLICY "Public cannot access call logs" ON farmer_call_logs
  FOR SELECT
  TO public
  USING (FALSE);

-- Add WhatsApp fields for Phase 11G.3 preparation
ALTER TABLE farmers_applications ADD COLUMN IF NOT EXISTS whatsapp_phone TEXT NULL;
ALTER TABLE farmers_applications ADD COLUMN IF NOT EXISTS whatsapp_opted_in BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE farmers_applications ADD COLUMN IF NOT EXISTS whatsapp_opted_in_at TIMESTAMP WITH TIME ZONE NULL;

CREATE INDEX IF NOT EXISTS idx_farmers_applications_whatsapp_opted_in ON farmers_applications(whatsapp_opted_in);
