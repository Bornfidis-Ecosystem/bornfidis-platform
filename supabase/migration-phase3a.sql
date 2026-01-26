-- Phase 3A: Quote + Deposit Invoice Engine
-- Add quote fields to booking_inquiries table

-- Add quote columns to booking_inquiries
ALTER TABLE booking_inquiries
ADD COLUMN IF NOT EXISTS quote_currency TEXT DEFAULT 'USD',
ADD COLUMN IF NOT EXISTS quote_subtotal_cents INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS quote_tax_cents INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS quote_total_cents INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS quote_deposit_cents INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS quote_sent_at TIMESTAMP WITH TIME ZONE NULL,
ADD COLUMN IF NOT EXISTS stripe_payment_link_url TEXT NULL,
ADD COLUMN IF NOT EXISTS stripe_invoice_id TEXT NULL,
ADD COLUMN IF NOT EXISTS stripe_payment_status TEXT NULL,
ADD COLUMN IF NOT EXISTS quote_pdf_url TEXT NULL;

-- Create booking_quote_items table
CREATE TABLE IF NOT EXISTS booking_quote_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES booking_inquiries(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price_cents INTEGER NOT NULL DEFAULT 0,
  line_total_cents INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for quote items
CREATE INDEX IF NOT EXISTS idx_quote_items_booking_id ON booking_quote_items(booking_id);
CREATE INDEX IF NOT EXISTS idx_quote_items_sort_order ON booking_quote_items(booking_id, sort_order);

-- Enable Row Level Security on quote items
ALTER TABLE booking_quote_items ENABLE ROW LEVEL SECURITY;

-- Policy: Service role has full access to quote items
CREATE POLICY "Service role has full access to quote items"
ON booking_quote_items
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Note: All quote operations happen server-side via service role
-- Future: Add authenticated user policies if needed for direct client access
