-- Phase 3C: Final Balance Payments
-- Add quote totals and balance payment fields to booking_inquiries

-- Add quote columns (using IF NOT EXISTS to avoid conflicts with Phase 3B)
ALTER TABLE booking_inquiries
ADD COLUMN IF NOT EXISTS quote_subtotal_cents INTEGER DEFAULT 0 NOT NULL,
ADD COLUMN IF NOT EXISTS quote_tax_cents INTEGER DEFAULT 0 NOT NULL,
ADD COLUMN IF NOT EXISTS quote_service_fee_cents INTEGER DEFAULT 0 NOT NULL,
ADD COLUMN IF NOT EXISTS quote_total_cents INTEGER DEFAULT 0 NOT NULL,
ADD COLUMN IF NOT EXISTS deposit_percentage INTEGER DEFAULT 30 NOT NULL,
ADD COLUMN IF NOT EXISTS balance_amount_cents INTEGER DEFAULT 0 NOT NULL,
ADD COLUMN IF NOT EXISTS balance_paid_at TIMESTAMP WITH TIME ZONE NULL,
ADD COLUMN IF NOT EXISTS fully_paid_at TIMESTAMP WITH TIME ZONE NULL,
ADD COLUMN IF NOT EXISTS quote_notes TEXT NULL,
ADD COLUMN IF NOT EXISTS quote_line_items JSONB DEFAULT '[]'::jsonb NOT NULL,
ADD COLUMN IF NOT EXISTS stripe_balance_session_id TEXT NULL,
ADD COLUMN IF NOT EXISTS stripe_balance_payment_intent_id TEXT NULL;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_booking_quote_total_cents ON booking_inquiries(quote_total_cents);
CREATE INDEX IF NOT EXISTS idx_booking_balance_paid_at ON booking_inquiries(balance_paid_at);
CREATE INDEX IF NOT EXISTS idx_booking_fully_paid_at ON booking_inquiries(fully_paid_at);

-- Note: If Phase 3B columns exist, this migration will skip them (IF NOT EXISTS)
-- The JSONB quote_line_items replaces the separate quote_line_items table approach
