-- Consolidated Migration: Phase 3A + 3B + 3C
-- Run this to ensure all required columns exist
-- Safe to run multiple times (uses IF NOT EXISTS)

-- Phase 3A: Deposit Payment columns
ALTER TABLE booking_inquiries
ADD COLUMN IF NOT EXISTS stripe_session_id TEXT NULL,
ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT NULL,
ADD COLUMN IF NOT EXISTS deposit_amount_cents INTEGER NULL,
ADD COLUMN IF NOT EXISTS paid_at TIMESTAMP WITH TIME ZONE NULL;

-- Phase 3B: Quote Builder columns (if not already added)
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

-- Phase 3C: Final Balance Payment columns
ALTER TABLE booking_inquiries
ADD COLUMN IF NOT EXISTS quote_subtotal_cents INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS quote_tax_cents INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS quote_service_fee_cents INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS quote_total_cents INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS deposit_percentage INTEGER DEFAULT 30,
ADD COLUMN IF NOT EXISTS quote_line_items JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS stripe_balance_session_id TEXT NULL,
ADD COLUMN IF NOT EXISTS stripe_balance_payment_intent_id TEXT NULL,
ADD COLUMN IF NOT EXISTS invoice_pdf_url TEXT NULL;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_booking_stripe_session ON booking_inquiries(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_booking_paid_at ON booking_inquiries(paid_at);
CREATE INDEX IF NOT EXISTS idx_booking_quote_total_cents ON booking_inquiries(quote_total_cents);
CREATE INDEX IF NOT EXISTS idx_booking_balance_paid_at ON booking_inquiries(balance_paid_at);
CREATE INDEX IF NOT EXISTS idx_booking_fully_paid_at ON booking_inquiries(fully_paid_at);

-- Note: This migration is safe to run multiple times
-- It will skip columns that already exist
