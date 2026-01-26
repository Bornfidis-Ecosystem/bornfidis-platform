-- Phase 4B: Customer Portal
-- Add portal token columns and customer messages table

-- Add portal token columns to booking_inquiries
ALTER TABLE booking_inquiries
ADD COLUMN IF NOT EXISTS customer_portal_token TEXT NULL,
ADD COLUMN IF NOT EXISTS customer_portal_token_created_at TIMESTAMP WITH TIME ZONE NULL,
ADD COLUMN IF NOT EXISTS customer_portal_token_revoked_at TIMESTAMP WITH TIME ZONE NULL;

-- Create unique index on customer_portal_token (only for non-null, non-revoked tokens)
CREATE UNIQUE INDEX IF NOT EXISTS idx_booking_portal_token_active 
ON booking_inquiries(customer_portal_token) 
WHERE customer_portal_token IS NOT NULL AND customer_portal_token_revoked_at IS NULL;

-- Create index for token lookups
CREATE INDEX IF NOT EXISTS idx_booking_portal_token ON booking_inquiries(customer_portal_token);

-- Create customer_messages table
CREATE TABLE IF NOT EXISTS customer_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES booking_inquiries(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create index on booking_id for efficient lookups
CREATE INDEX IF NOT EXISTS idx_customer_messages_booking_id ON customer_messages(booking_id);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_customer_messages_created_at ON customer_messages(created_at DESC);

-- Enable RLS on customer_messages
ALTER TABLE customer_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Service role has full access
-- (Service role bypasses RLS, so no explicit policy needed for server-side access)
-- For future: If we add authenticated user access, add policies here

-- Note: Portal tokens are generated server-side using crypto.randomBytes or similar
-- Tokens should be at least 32 characters long for security
