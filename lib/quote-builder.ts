import { z } from 'zod'

/** Line item input for quote generation — matches `booking_items` scalars (USD). */
export const quoteBuilderLineSchema = z.object({
  item_type: z.string().min(1),
  item_name: z.string().min(1),
  description: z.string().optional().nullable(),
  quantity: z.number().int().positive(),
  unit_price_usd: z.number().nonnegative(),
  category: z.string().optional().nullable(),
})

export type QuoteBuilderLine = z.infer<typeof quoteBuilderLineSchema>

export type QuoteTotalsUsd = {
  subtotal_usd: number
  tax_usd: number
  discount_usd: number
  total_usd: number
  deposit_percentage: number
  deposit_amount_usd: number
}

export function roundUsd(n: number): number {
  return Math.round(n * 100) / 100
}

/**
 * Recompute subtotal/total/deposit from line items + tax/discount (server-truth).
 */
export function computeQuoteTotalsUsd(input: {
  lines: QuoteBuilderLine[]
  tax_usd?: number | null
  discount_usd?: number | null
  deposit_percentage: number
}): QuoteTotalsUsd {
  const tax_usd = roundUsd(input.tax_usd ?? 0)
  const discount_usd = roundUsd(input.discount_usd ?? 0)

  let subtotal_usd = 0
  for (const line of input.lines) {
    const q = line.quantity
    const lineTotal = roundUsd(q * line.unit_price_usd)
    subtotal_usd = roundUsd(subtotal_usd + lineTotal)
  }

  const total_usd = roundUsd(subtotal_usd + tax_usd - discount_usd)
  const deposit_amount_usd = roundUsd((total_usd * input.deposit_percentage) / 100)

  return {
    subtotal_usd,
    tax_usd,
    discount_usd,
    total_usd,
    deposit_percentage: input.deposit_percentage,
    deposit_amount_usd,
  }
}

export function mapLinesToBookingItemsCreate(
  bookingId: string,
  quoteId: string,
  lines: QuoteBuilderLine[],
): Array<{
  booking_id: string
  quote_id: string
  item_type: string
  item_name: string
  description: string | null
  quantity: number
  unit_price_usd: number
  total_price_usd: number
  category: string | null
}> {
  return lines.map((line) => {
    const quantity = line.quantity
    const unit = roundUsd(line.unit_price_usd)
    const total_price_usd = roundUsd(quantity * unit)
    return {
      booking_id: bookingId,
      quote_id: quoteId,
      item_type: line.item_type,
      item_name: line.item_name,
      description: line.description ?? null,
      quantity,
      unit_price_usd: unit,
      total_price_usd,
      category: line.category ?? null,
    }
  })
}
