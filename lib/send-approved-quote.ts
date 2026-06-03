import { z } from 'zod'
import { db } from '@/lib/db'
import { AgentQuoteSchema, type AgentQuote, type EventInquiry } from '@/lib/anthropic-quote-agent'
import { sendQuoteEmail } from '@/lib/quote-email'
import { markPrismaQuoteSent } from '@/lib/save-agent-quote-db'

const LINE_CATEGORIES = ['chef_service', 'produce', 'equipment', 'travel', 'other'] as const

function normalizeCategory(raw: string | null | undefined): (typeof LINE_CATEGORIES)[number] {
  const v = (raw || 'other').toLowerCase().trim()
  return (LINE_CATEGORIES as readonly string[]).includes(v)
    ? (v as (typeof LINE_CATEGORIES)[number])
    : 'other'
}

/** Coerce Prisma Decimal / unknown to a finite USD amount for validation + email. */
function toFiniteUsd(label: string, value: unknown): number {
  const n = typeof value === 'object' && value !== null && 'toNumber' in value
    ? (value as { toNumber: () => number }).toNumber()
    : Number(value)
  if (!Number.isFinite(n) || n < 0) {
    throw new Error(`Invalid ${label} for outbound quote`)
  }
  return n
}

function toPositiveQty(label: string, value: unknown): number {
  const n = Number(value ?? 1)
  if (!Number.isFinite(n) || n <= 0) {
    throw new Error(`Invalid ${label} for outbound quote line`)
  }
  return n
}

function parseUnitFromNotes(notes: string | null | undefined): string {
  if (!notes?.trim()) return 'ea'
  const m = notes.match(/unit:\s*([^—]+)/i)
  const u = m?.[1]?.trim()
  return u && u.length > 0 ? u : 'ea'
}

function buildEventInquiryFromBooking(booking: {
  customer_name: string
  customer_email: string | null
  customer_phone: string
  service_type: string
  event_date: Date
  guest_count: number | null
  location: string
}): EventInquiry {
  return {
    client_name: booking.customer_name.trim(),
    client_email: booking.customer_email?.trim() ?? '',
    client_phone: booking.customer_phone.trim(),
    event_type: booking.service_type.trim(),
    event_date: booking.event_date.toISOString().slice(0, 10),
    guest_count: Math.max(1, Math.floor(Number(booking.guest_count ?? 1))),
    location: booking.location.trim(),
  }
}

function buildAgentQuoteFromRows(
  quote: {
    service_type: string
    subtotal_usd: unknown
    tax_usd: unknown
    discount_usd: unknown
    total_usd: unknown
    deposit_percentage: number | null
    deposit_amount_usd: unknown
    payment_terms: string | null
    notes: string | null
    customer_notes: string | null
    expires_date: Date | null
  },
  items: Array<{
    item_name: string
    description: string | null
    quantity: number | null
    unit_price_usd: unknown
    total_price_usd: unknown
    category: string | null
    notes: string | null
  }>,
): AgentQuote {
  const line_items = items.map((row) => {
    const qty = toPositiveQty('quantity', row.quantity ?? 1)
    const unit_price_usd = toFiniteUsd('unit_price_usd', row.unit_price_usd)
    const subtotal_usd = toFiniteUsd('total_price_usd', row.total_price_usd)
    return {
      description: row.item_name.trim(),
      category: normalizeCategory(row.category),
      quantity: qty,
      unit: parseUnitFromNotes(row.notes),
      unit_price_usd,
      subtotal_usd,
      notes:
        row.description?.trim() && row.description.trim() !== row.item_name.trim()
          ? row.description.trim()
          : undefined,
    }
  })

  let expires_days = 14
  if (quote.expires_date) {
    const ms = quote.expires_date.getTime() - Date.now()
    expires_days = Math.max(1, Math.min(365, Math.ceil(ms / 86400000)))
  }

  return {
    service_type: quote.service_type.trim(),
    line_items,
    subtotal_usd: toFiniteUsd('subtotal_usd', quote.subtotal_usd),
    tax_usd: toFiniteUsd('tax_usd', quote.tax_usd ?? 0),
    discount_usd: toFiniteUsd('discount_usd', quote.discount_usd ?? 0),
    total_usd: toFiniteUsd('total_usd', quote.total_usd),
    deposit_percentage: Math.min(100, Math.max(0, Math.round(Number(quote.deposit_percentage ?? 50)))),
    deposit_amount_usd: toFiniteUsd('deposit_amount_usd', quote.deposit_amount_usd ?? 0),
    payment_terms: (quote.payment_terms ?? '').trim(),
    notes: (quote.notes ?? '').trim(),
    customer_notes: (quote.customer_notes ?? '').trim(),
    expires_days,
    confidence: 'high',
    confidence_reason: 'Sent from approved quote in database',
  }
}

/**
 * Sends the stored HTML quote email and marks the quote sent (admin approval path).
 *
 * **Trust:** Intended only for authenticated admin callers (e.g. `POST /api/admin/quotes/[quoteId]/send`).
 * Reconstructs `AgentQuote` from DB rows and validates with {@link AgentQuoteSchema} before Resend.
 */
export async function sendApprovedQuoteById(quoteId: string): Promise<{ success: boolean; error?: string }> {
  const idCheck = z.string().uuid().safeParse(quoteId)
  if (!idCheck.success) {
    return { success: false, error: 'Invalid quote id' }
  }

  const quote = await db.quotes.findUnique({
    where: { id: quoteId },
    include: {
      bookings: true,
      booking_items: { orderBy: { created_at: 'asc' } },
    },
  })

  if (!quote?.bookings || !quote.quote_number?.trim()) {
    return { success: false, error: 'Quote, booking, or quote_number not found' }
  }

  if (quote.booking_items.length === 0) {
    return { success: false, error: 'Quote has no line items' }
  }

  if ((quote.quote_status || '').toLowerCase() === 'sent') {
    return { success: false, error: 'Quote is already sent' }
  }

  const inquiry = buildEventInquiryFromBooking(quote.bookings)
  if (!inquiry.client_email.includes('@')) {
    return { success: false, error: 'Booking has no valid client email for outbound mail' }
  }

  let agentQuote: AgentQuote
  try {
    agentQuote = buildAgentQuoteFromRows(quote, quote.booking_items)
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Invalid quote data'
    return { success: false, error: msg }
  }

  const validated = AgentQuoteSchema.safeParse(agentQuote)
  if (!validated.success) {
    return {
      success: false,
      error: `Quote payload failed validation: ${validated.error.errors.map((x) => x.message).join('; ')}`,
    }
  }

  const email = await sendQuoteEmail(inquiry, validated.data, quote.quote_number.trim())
  if (!email.success) {
    return { success: false, error: email.error || 'Email failed' }
  }

  await markPrismaQuoteSent(quoteId)
  return { success: true }
}
