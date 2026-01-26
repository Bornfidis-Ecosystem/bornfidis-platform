-- Bornfidis Provisions - Booking Inquiries Table
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS booking_inquiries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Customer Info
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL,
  
  -- Event Details
  event_date DATE NOT NULL,
  event_time TEXT,
  location TEXT NOT NULL,
  
  -- Service Specs
  guests INTEGER,
  budget_range TEXT,
  dietary TEXT,
  notes TEXT,
  
  -- Admin Fields
  status TEXT NOT NULL DEFAULT 'New',
  follow_up_date DATE
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_booking_status ON booking_inquiries(status);
CREATE INDEX IF NOT EXISTS idx_booking_event_date ON booking_inquiries(event_date);
CREATE INDEX IF NOT EXISTS idx_booking_created_at ON booking_inquiries(created_at DESC);

-- Enable Row Level Security
ALTER TABLE booking_inquiries ENABLE ROW LEVEL SECURITY;

-- Policy 1: Public can INSERT (submit bookings)
CREATE POLICY "Public can submit bookings"
ON booking_inquiries
FOR INSERT
TO anon
WITH CHECK (true);

-- Policy 2: Service role can SELECT and UPDATE (for server-side operations)
-- Note: In Phase 1, we use service role key for admin operations
-- This policy allows the service role to do everything
CREATE POLICY "Service role has full access"
ON booking_inquiries
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Note: For Phase 2, you'll add authenticated user policies when implementing proper auth
