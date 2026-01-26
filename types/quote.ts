/**
 * Phase 3A: Quote types and interfaces
 */

export interface QuoteItem {
  id?: string // Optional for new items (will be generated on save)
  booking_id: string
  title: string
  description?: string
  quantity: number
  unit_price_cents: number
  line_total_cents: number
  sort_order: number
  created_at?: string
}

export interface QuoteDraft {
  items: QuoteItem[]
  notes?: string
  tax_dollars?: number // Tax amount in dollars (will be converted to cents)
  deposit_percent?: number // Deposit percentage (default 30%)
}

export interface QuoteTotals {
  subtotal_cents: number
  tax_cents: number
  total_cents: number
  deposit_cents: number
}

export interface BookingQuote {
  booking_id: string
  currency: string
  subtotal_cents: number
  tax_cents: number
  total_cents: number
  deposit_cents: number
  quote_sent_at?: string
  stripe_payment_link_url?: string
  stripe_invoice_id?: string
  stripe_payment_status?: 'unpaid' | 'paid' | 'void' | 'n/a'
  quote_pdf_url?: string
  items: QuoteItem[]
  notes?: string
}
