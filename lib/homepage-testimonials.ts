import { db } from '@/lib/db'
import { Prisma } from '@prisma/client'

export type HomepageTestimonial = {
  id: string
  quote: string
  name: string
  eventType?: string | null
}

function shorten(text: string, max = 220) {
  const clean = text.trim()
  if (clean.length <= max) return clean
  return `${clean.slice(0, max).trim()}…`
}

function formatClientName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return 'Guest'
  if (parts.length === 1) return parts[0]
  return `${parts[0]} ${parts[1]![0]}.`
}

/** One line for quote/deposit emails — shorter than homepage cards. */
const QUOTE_EMAIL_QUOTE_MAX = 120

export type QuoteDepositTestimonialSnippet = {
  quote: string
  name: string
}

type SnippetRow = { name: string; testimonial_text: string | null }

type HomepageRow = {
  id: string
  name: string
  testimonial_text: string | null
  event_type: string | null
  testimonial_received_at: Date | null
  updated_at: Date | null
}

/**
 * Uses raw SQL so it still works if `prisma generate` failed (Windows EPERM) and the
 * generated client is missing testimonial fields. Requires DB columns from schema.
 */
export async function getQuoteDepositTestimonialSnippet(
  excludeBookingId?: string,
): Promise<QuoteDepositTestimonialSnippet | null> {
  try {
    const rows = excludeBookingId
      ? await db.$queryRaw<SnippetRow[]>(Prisma.sql`
        SELECT name, testimonial_text
        FROM booking_inquiries
        WHERE testimonial_approved = true
          AND testimonial_text IS NOT NULL
          AND trim(testimonial_text) <> ''
          AND id <> ${excludeBookingId}::uuid
        ORDER BY testimonial_received_at DESC NULLS LAST, updated_at DESC NULLS LAST
        LIMIT 1
      `)
      : await db.$queryRaw<SnippetRow[]>(Prisma.sql`
        SELECT name, testimonial_text
        FROM booking_inquiries
        WHERE testimonial_approved = true
          AND testimonial_text IS NOT NULL
          AND trim(testimonial_text) <> ''
        ORDER BY testimonial_received_at DESC NULLS LAST, updated_at DESC NULLS LAST
        LIMIT 1
      `)

    const row = rows[0]
    if (!row?.testimonial_text?.trim()) return null

    const raw = row.testimonial_text.trim()
    const oneLine = raw.replace(/\s+/g, ' ')
    const safe = oneLine.replace(/"/g, "'")

    return {
      quote: shorten(safe, QUOTE_EMAIL_QUOTE_MAX),
      name: formatClientName(row.name),
    }
  } catch (e) {
    console.error('[getQuoteDepositTestimonialSnippet]', e)
    return null
  }
}

export async function getHomepageTestimonials(): Promise<HomepageTestimonial[]> {
  try {
    const rows = await db.$queryRaw<HomepageRow[]>(Prisma.sql`
    SELECT id, name, testimonial_text, event_type, testimonial_received_at, updated_at
    FROM booking_inquiries
    WHERE testimonial_approved = true
      AND testimonial_text IS NOT NULL
      AND trim(testimonial_text) <> ''
    ORDER BY testimonial_received_at DESC NULLS LAST, updated_at DESC NULLS LAST
    LIMIT 3
  `)

    return rows
      .filter((row) => row.testimonial_text && row.testimonial_text.trim().length > 0)
      .map((row) => ({
        id: row.id,
        quote: shorten(row.testimonial_text!.trim()),
        name: formatClientName(row.name),
        eventType: row.event_type,
      }))
  } catch (e) {
    console.error('[getHomepageTestimonials]', e)
    return []
  }
}
