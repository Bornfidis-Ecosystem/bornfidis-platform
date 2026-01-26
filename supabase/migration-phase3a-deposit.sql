-- Phase 3A: Stripe Deposit Payments
-- Add deposit payment tracking columns to booking_inquiries table

-- Add deposit payment columns
ALTER TABLE booking_inquiries
ADD COLUMN IF NOT EXISTS stripe_session_id TEXT NULL,
ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT NULL,
ADD COLUMN IF NOT EXISTS deposit_amount_cents INTEGER NULL,
ADD COLUMN IF NOT EXISTS paid_at TIMESTAMP WITH TIME ZONE NULL;

-- Create index for payment status queries
CREATE INDEX IF NOT EXISTS idx_booking_stripe_session ON booking_inquiries(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_booking_paid_at ON booking_inquiries(paid_at);

-- Note: These columns track deposit payments separately from quote system
-- stripe_session_id: Stripe Checkout Session ID
-- stripe_payment_intent_id: Stripe Payment Intent ID (from completed session)
-- deposit_amount_cents: Amount of deposit paid (in cents)
-- paid_at: Timestamp when payment was completed
