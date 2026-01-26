export type BookingStatus = 'pending' | 'reviewed' | 'quoted' | 'booked' | 'declined' | 'New' | 'Contacted' | 'Confirmed' | 'Closed'
export type QuoteStatus = 'draft' | 'sent' | 'accepted' | 'declined'

export interface QuoteLineItem {
  id?: string
  booking_id: string
  title: string
  description?: string
  quantity: number
  unit_price_cents: number
  sort_order: number
  created_at?: string
  updated_at?: string
}

export interface BookingInquiry {
  id: string
  createdAt: string
  updatedAt?: string
  name: string
  email?: string
  phone?: string
  event_date: string
  event_time?: string
  location: string
  guests?: number
  budget_range?: string
  dietary?: string
  notes?: string
  status: BookingStatus
  follow_up_date?: string
  admin_notes?: string // Phase 2A: Admin-only notes field
  // Phase 3A: Quote fields (legacy, may overlap with Phase 3B)
  quote_currency?: string
  quote_subtotal_cents?: number
  quote_tax_cents?: number
  quote_total_cents?: number
  quote_deposit_cents?: number
  quote_sent_at?: string
  stripe_payment_link_url?: string
  stripe_invoice_id?: string
  stripe_payment_status?: 'unpaid' | 'paid' | 'void' | 'n/a'
  quote_pdf_url?: string
  // Phase 3A: Deposit Payment fields
  stripe_session_id?: string
  stripe_payment_intent_id?: string
  deposit_amount_cents?: number
  paid_at?: string
  // Phase 3B: Quote Builder fields (legacy, may overlap with Phase 3C)
  quote_status?: QuoteStatus
  quote_notes?: string
  deposit_percent?: number
  subtotal_cents?: number
  tax_cents?: number
  service_fee_cents?: number
  total_cents?: number
  balance_session_id?: string
  balance_payment_intent_id?: string
  balance_paid_at?: string
  balance_amount_cents?: number
  fully_paid_at?: string
  quote_updated_at?: string
  // Phase 3C: Final Balance Payment fields
  quote_subtotal_cents?: number
  quote_tax_cents?: number
  quote_service_fee_cents?: number
  quote_total_cents?: number
  deposit_percentage?: number
  quote_line_items?: QuoteLineItem[] // Stored as JSONB in database
  stripe_balance_session_id?: string
  stripe_balance_payment_intent_id?: string
  invoice_pdf_url?: string
  // Phase 4B: Customer Portal fields
  customer_portal_token?: string
  customer_portal_token_created_at?: string
  customer_portal_token_revoked_at?: string
  // Phase 5B: Chef Assignment & Payout fields
  assigned_chef_id?: string
  chef_payout_amount_cents?: number
  chef_payout_status?: 'not_applicable' | 'pending' | 'paid' | 'blocked'
  chef_payout_blockers?: string[]
  chef_payout_paid_at?: string
  stripe_transfer_id?: string
  // Phase 5D: Completion + Payout Release Guardrails
  job_completed_at?: string
  job_completed_by?: 'chef' | 'admin'
  payout_hold?: boolean
  payout_hold_reason?: string
  payout_released_at?: string
}
