-- Fix RLS policies for whatsapp_messages table
-- Run this in Supabase Dashboard → SQL Editor
-- This allows Prisma (using direct database connection) to access the table

-- Drop existing policies
DROP POLICY IF EXISTS "Service role can manage whatsapp_messages" ON whatsapp_messages;
DROP POLICY IF EXISTS "Authenticated users can read whatsapp_messages" ON whatsapp_messages;
DROP POLICY IF EXISTS "Allow all database connections" ON whatsapp_messages;

-- Allow service role (for Supabase client with service role key)
CREATE POLICY "Service role can manage whatsapp_messages"
  ON whatsapp_messages
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Allow all database connections (for Prisma direct connection)
-- This policy applies to all roles including postgres, authenticated, etc.
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
