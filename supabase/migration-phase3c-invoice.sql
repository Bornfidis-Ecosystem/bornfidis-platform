-- Phase 3C: Final Balance Payments and Invoicing
-- Add invoice PDF URL field to booking_inquiries

-- Add invoice_pdf_url column
ALTER TABLE booking_inquiries
ADD COLUMN IF NOT EXISTS invoice_pdf_url TEXT NULL;

-- Note: balance_amount_cents, balance_paid_at, fully_paid_at already added in Phase 3B
-- This migration only adds the invoice_pdf_url field for storing generated invoice PDFs
