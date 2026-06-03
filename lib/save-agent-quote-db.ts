import { db } from '@/lib/db'
import type { AgentQuote, EventInquiry } from '@/lib/anthropic-quote-agent'
import { allocateNextQuoteNumber } from '@/lib/quote-number'
import { roundUsd } from '@/lib/quote-builder'

export interface SaveQuoteResult {
  booking_id: string
  quote_id: string
  quote_number: string
}

function buildSpecialRequests(inquiry: EventInquiry): string | null {
  const parts = [
    inquiry.additional_notes?.trim(),
    inquiry.budget_indication ? `Budget: ${inquiry.budget_indication}` : null,
  ].filter(Boolean) as string[]
  return parts.length ? parts.join('\n\n') : null
}

function mapLineToBookingItem(
  bookingId: string,
  quoteId: string,
  item: AgentQuote['line_items'][number],
) {
  const q = Math.max(1, Math.round(item.quantity))
  const total = roundUsd(item.subtotal_usd)
  const unit = roundUsd(item.unit_price_usd)
  const name =
    item.description.length > 200 ? `${item.description.slice(0, 197)}...` : item.description
  const noteParts = [item.unit ? `unit: ${item.unit}` : null, item.notes?.trim()].filter(Boolean)
  return {
    booking_id: bookingId,
    quote_id: quoteId,
    item_type: item.category,
    item_name: name,
    description: item.description !== name ? item.description : null,
    quantity: q,
    unit_price_usd: unit,
    total_price_usd: total,
    category: item.category,
    notes: noteParts.length ? noteParts.join(' — ') : null,
  }
}

/**
 * Persists an {@link AgentQuote} to `bookings`, `quotes`, and `booking_items` using the real schema.
 * When creating a new booking, {@link EventInquiry.client_phone} is required (maps to `customer_phone`).
 */
export async function saveQuoteToDatabase(
  inquiry: EventInquiry,
  agentQuote: AgentQuote,
  existingBookingId?: string,
): Promise<SaveQuoteResult> {
  const expiresDate = new Date()
  expiresDate.setUTCDate(expiresDate.getUTCDate() + (agentQuote.expires_days ?? 14))
  expiresDate.setUTCHours(0, 0, 0, 0)

  const result = await db.$transaction(async (tx) => {
    let bookingId = existingBookingId

    if (!bookingId) {
      const phone = inquiry.client_phone?.trim()
      if (!phone) {
        throw new Error('client_phone is required on EventInquiry when creating a new booking')
      }

      const eventDate = inquiry.event_date?.trim()
        ? new Date(inquiry.event_date + 'T12:00:00.000Z')
        : null
      if (!eventDate || Number.isNaN(eventDate.getTime())) {
        throw new Error('event_date must be a valid ISO date string')
      }

      const dietary: string[] = []
      if (inquiry.dietary_notes?.trim()) {
        dietary.push(inquiry.dietary_notes.trim())
      }

      const booking = await tx.bookings.create({
        data: {
          customer_name: inquiry.client_name.trim(),
          customer_phone: phone,
          customer_email: inquiry.client_email?.trim() || null,
          service_type: inquiry.event_type.trim(),
          event_date: eventDate,
          location: inquiry.location.trim(),
          guest_count: inquiry.guest_count,
          special_requests: buildSpecialRequests(inquiry),
          dietary_restrictions: dietary,
          booking_status: 'quote_pending',
          source: 'ai_quote_agent',
        },
      })
      bookingId = booking.id
    } else {
      const existing = await tx.bookings.findUnique({ where: { id: bookingId } })
      if (!existing) {
        throw new Error('Booking not found')
      }
    }

    const quote_number = await allocateNextQuoteNumber(tx)

    const version =
      (await tx.quotes.count({
        where: { booking_id: bookingId },
      })) + 1

    const quote = await tx.quotes.create({
      data: {
        booking_id: bookingId,
        quote_number,
        service_type: agentQuote.service_type,
        subtotal_usd: agentQuote.subtotal_usd,
        tax_usd: agentQuote.tax_usd,
        discount_usd: agentQuote.discount_usd,
        total_usd: agentQuote.total_usd,
        deposit_percentage: Math.round(agentQuote.deposit_percentage),
        deposit_amount_usd: agentQuote.deposit_amount_usd,
        payment_terms: agentQuote.payment_terms,
        notes: agentQuote.notes,
        customer_notes: agentQuote.customer_notes,
        quote_status: 'draft',
        expires_date: expiresDate,
        version,
      },
    })

    await tx.booking_items.createMany({
      data: agentQuote.line_items.map((line) => mapLineToBookingItem(bookingId!, quote.id, line)),
    })

    await tx.bookings.update({
      where: { id: bookingId },
      data: {
        quoted_amount_usd: agentQuote.total_usd,
        updated_at: new Date(),
      },
    })

    return {
      booking_id: bookingId,
      quote_id: quote.id,
      quote_number,
    }
  })

  return result
}

/**
 * After Resend succeeds — sets `quotes.quote_status` and `sent_date` (@db.Date).
 * Distinct from `markQuoteSent` in `quote-actions.ts` (that targets `booking_inquiries`).
 */
export async function markPrismaQuoteSent(quoteId: string): Promise<void> {
  const now = new Date()
  const sentDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))

  await db.quotes.update({
    where: { id: quoteId },
    data: {
      quote_status: 'sent',
      sent_date: sentDate,
      updated_at: new Date(),
    },
  })
}
