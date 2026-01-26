-- Phase 3B: Quote Builder + Final Balance Payment
-- Add quote fields to booking_inquiries and create quote_line_items table

-- Add quote columns to booking_inquiries
ALTER TABLE booking_inquiries
ADD COLUMN IF NOT EXISTS quote_status TEXT DEFAULT 'draft',
ADD COLUMN IF NOT EXISTS quote_notes TEXT NULL,
ADD COLUMN IF NOT EXISTS deposit_percent INTEGER DEFAULT 30,
ADD COLUMN IF NOT EXISTS subtotal_cents INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS tax_cents INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS service_fee_cents INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_cents INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS balance_session_id TEXT NULL,
ADD COLUMN IF NOT EXISTS balance_payment_intent_id TEXT NULL,
ADD COLUMN IF NOT EXISTS balance_paid_at TIMESTAMP WITH TIME ZONE NULL,
ADD COLUMN IF NOT EXISTS balance_amount_cents INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS fully_paid_at TIMESTAMP WITH TIME ZONE NULL,
ADD COLUMN IF NOT EXISTS quote_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create quote_line_items table
CREATE TABLE IF NOT EXISTS quote_line_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES booking_inquiries(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price_cents INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_quote_line_items_booking_id ON quote_line_items(booking_id);
CREATE INDEX IF NOT EXISTS idx_booking_balance_session ON booking_inquiries(balance_session_id);
CREATE INDEX IF NOT EXISTS idx_booking_balance_paid_at ON booking_inquiries(balance_paid_at);

-- Enable Row Level Security on quote_line_items
ALTER TABLE quote_line_items ENABLE ROW LEVEL SECURITY;

-- Policy: Service role has full access to quote line items
CREATE POLICY "Service role has full access to quote line items"
ON quote_line_items
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Note: All quote operations happen server-side via service role
-- Future: Add authenticated user policies if needed for direct client access

-- Add constraint for quote_status
ALTER TABLE booking_inquiries
ADD CONSTRAINT check_quote_status 
CHECK (quote_status IN ('draft', 'sent', 'accepted', 'declined'));
