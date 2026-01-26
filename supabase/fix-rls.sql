-- Quick Fix for RLS Policy Issue
-- Run this in Supabase SQL Editor if you're getting "row-level security policy" errors

-- First, drop existing policies if they exist (optional - only if you want to recreate them)
DROP POLICY IF EXISTS "Public can submit bookings" ON booking_inquiries;
DROP POLICY IF EXISTS "Service role has full access" ON booking_inquiries;

-- Recreate Policy 1: Public can INSERT (submit bookings)
CREATE POLICY "Public can submit bookings"
ON booking_inquiries
FOR INSERT
TO anon
WITH CHECK (true);

-- Recreate Policy 2: Service role can do everything (for server-side operations)
CREATE POLICY "Service role has full access"
ON booking_inquiries
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Verify RLS is enabled
ALTER TABLE booking_inquiries ENABLE ROW LEVEL SECURITY;

-- Note: The code now uses service_role key for inserts (supabaseAdmin),
-- which bypasses RLS entirely. This is the recommended approach for Phase 1.
