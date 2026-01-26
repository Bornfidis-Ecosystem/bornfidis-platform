-- Phase 2A Migration: Add admin_notes field to booking_inquiries
-- Run this in your Supabase SQL Editor

-- Add admin_notes column if it doesn't exist
ALTER TABLE booking_inquiries 
ADD COLUMN IF NOT EXISTS admin_notes TEXT;

-- Add comment for documentation
COMMENT ON COLUMN booking_inquiries.admin_notes IS 'Internal admin notes - not visible to customers';

-- Note: RLS policies already allow service_role to update all fields, so no policy changes needed
