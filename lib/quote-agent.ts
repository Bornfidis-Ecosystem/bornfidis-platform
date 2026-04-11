import { z } from 'zod'
import { db } from '@/lib/db'
import {
  computeQuoteTotalsUsd,
  mapLinesToBookingItemsCreate,
  quoteBuilderLineSchema,
} from '@/lib/quote-builder'

export const generateQuoteBodySchema = z.object({
  booking_id: z.string().uuid(),
  service_type: z.string().min(1),
  lines: z.array(quoteBuilderLineSchema).min(1),
  tax_usd: z.number().nonnegative().optional(),
  discount_usd: z.number().nonnegative().optional(),
  deposit_percentage: z.number().min(0).max(100).optional().default(50),
  notes: z.string().optional().nullable(),
  customer_notes: z.string().optional().nullable(),
  payment_terms: z.string().optional().nullable(),
  expires_days: z.number().int().min(1).max(365).optional().default(7),
  send_email: z.boolean().optional().default(false),
})

export type GenerateQuoteBody = z.infer<typeof generateQuoteBodySchema>

export type PersistQuoteResult = {
  quoteId: string
  bookingId: string
  totals: ReturnType<typeof computeQuoteTotalsUsd>
}

export type PersistQuoteOutcome =
  | { ok: true; data: PersistQuoteResult }
  | { ok: false; error: string; code: 'not_found' | 'db_error' }

/**
 * Creates `quotes` + `booking_items`, optionally marks quote sent + updates `bookings`.
 * Email is not sent here — use `lib/quote-email` after success.
 */
export async function persistQuoteForBooking(
  input: GenerateQuoteBody,
): Promise<PersistQuoteOutcome> {
  const totals = computeQuoteTotalsUsd({
    lines: input.lines,
    tax_usd: input.tax_usd,
    discount_usd: input.discount_usd,
    deposit_percentage: input.deposit_percentage,
  })

  const send = input.send_email === true
  const today = new Date()
  const dateOnly = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()))
  const expiresMs = (input.expires_days ?? 7) * 24 * 60 * 60 * 1000
  const defaultPaymentTerms =
    '50% deposit required to confirm booking. Balance due after service.'

  try {
    const data = await db.$transaction(async (tx) => {
      const booking = await tx.bookings.findUnique({
        where: { id: input.booking_id },
      })
      if (!booking) {
        return null
      }

      const quote = await tx.quotes.create({
        data: {
          booking_id: input.booking_id,
          service_type: input.service_type,
          subtotal_usd: totals.subtotal_usd,
          tax_usd: totals.tax_usd,
          discount_usd: totals.discount_usd,
          total_usd: totals.total_usd,
          quote_status: send ? 'sent' : 'draft',
          sent_date: send ? dateOnly : null,
          expires_date: new Date(dateOnly.getTime() + expiresMs),
          deposit_percentage: Math.round(input.deposit_percentage),
          deposit_amount_usd: totals.deposit_amount_usd,
          payment_terms: (input.payment_terms?.trim() || defaultPaymentTerms),
          notes: input.notes ?? null,
          customer_notes: input.customer_notes ?? null,
        },
      })

      const rows = mapLinesToBookingItemsCreate(input.booking_id, quote.id, input.lines)
      await tx.booking_items.createMany({ data: rows })

      await tx.bookings.update({
        where: { id: input.booking_id },
        data: {
          quoted_amount_usd: totals.total_usd,
          ...(send
            ? {
                booking_status: 'quoted',
                quote_sent_date: dateOnly,
              }
            : {}),
          updated_at: new Date(),
        },
      })

      return { quoteId: quote.id, bookingId: input.booking_id, totals }
    })

    if (!data) {
      return { ok: false, error: 'Booking not found', code: 'not_found' }
    }
    return { ok: true, data }
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Database error'
    console.error('[persistQuoteForBooking]', e)
    return { ok: false, error: msg, code: 'db_error' }
  }
}
