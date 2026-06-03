import { db } from '@/lib/db'

export type RelationalQuoteListRow = {
  id: string
  quote_number: string | null
  quote_status: string | null
  total_usd: unknown
  created_at: Date | null
  booking: {
    customer_name: string
    customer_email: string | null
    event_date: Date
    location: string
  } | null
}

/**
 * Recent relational (`bookings` / `quotes`) rows for the admin queue UI.
 */
export async function listRelationalQuotesForAdmin(
  take = 100,
): Promise<RelationalQuoteListRow[]> {
  const rows = await db.quotes.findMany({
    take,
    orderBy: { created_at: 'desc' },
    include: {
      bookings: {
        select: {
          customer_name: true,
          customer_email: true,
          event_date: true,
          location: true,
        },
      },
    },
  })

  return rows.map((q) => ({
    id: q.id,
    quote_number: q.quote_number,
    quote_status: q.quote_status,
    total_usd: q.total_usd,
    created_at: q.created_at,
    booking: q.bookings,
  }))
}
