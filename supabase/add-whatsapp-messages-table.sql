-- Add whatsapp_messages table to match Prisma schema
-- Run this in Supabase Dashboard → SQL Editor

CREATE TABLE IF NOT EXISTS whatsapp_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now() NOT NULL,
  phone_number text NOT NULL,
  message_text text NOT NULL,
  farmer_name text
);

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_created_at ON whatsapp_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_phone_number ON whatsapp_messages(phone_number);

-- Enable RLS (Row Level Security)
ALTER TABLE whatsapp_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Drop existing policies if they exist (idempotent)
DROP POLICY IF EXISTS "Service role can manage whatsapp_messages" ON whatsapp_messages;
DROP POLICY IF EXISTS "Authenticated users can read whatsapp_messages" ON whatsapp_messages;
DROP POLICY IF EXISTS "Allow all database connections" ON whatsapp_messages;

-- Allow service role to do everything (for Supabase client with service role key)
CREATE POLICY "Service role can manage whatsapp_messages"
  ON whatsapp_messages
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Allow all database connections (for Prisma direct connection and other DB clients)
-- This allows the postgres role and any other database roles to access the table
CREATE POLICY "Allow all database connections"
  ON whatsapp_messages
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users to read (for admin dashboard via Supabase client)
CREATE POLICY "Authenticated users can read whatsapp_messages"
  ON whatsapp_messages
  FOR SELECT
  TO authenticated
  USING (true);
