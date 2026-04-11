export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import type { Prisma } from '@prisma/client'
import { z } from 'zod'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/requireAdmin'

const QuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  per_page: z.coerce.number().int().min(1).max(100).default(25),
  status: z.string().optional(),
  confidence: z.string().optional(),
  search: z.string().optional(),
})

function parseConfidenceFromNotes(notes: string | null): {
  confidence: 'high' | 'medium' | 'low' | null
  confidence_reason: string | null
  clean_notes: string | null
} {
  let clean_notes = notes ?? ''
  let confidence: 'high' | 'medium' | 'low' | null = null
  let confidence_reason: string | null = null

  const match = clean_notes.match(/^confidence:(high|medium|low)(?:\n(.+?))?(?:\n|$)/i)
  if (match) {
    confidence = match[1].toLowerCase() as 'high' | 'medium' | 'low'
    confidence_reason = match[2]?.trim() ?? null
    clean_notes = clean_notes.replace(/^confidence:(high|medium|low)(?:\n.+?)?\n?/i, '').trim()
  }

  return {
    confidence,
    confidence_reason,
    clean_notes: clean_notes || null,
  }
}

export async function GET(req: NextRequest) {
  const authError = await requireAdmin(req)
  if (authError) return authError

  const { searchParams } = new URL(req.url)
  const parsed = QuerySchema.safeParse(Object.fromEntries(searchParams))
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid query', details: parsed.error.flatten() },
      { status: 400 },
    )
  }

  const { page, per_page, status, confidence, search } = parsed.data
  const skip = (page - 1) * per_page

  const statusTrim = status?.trim()
  const searchTrim = search?.trim()
  const confTrim = confidence?.trim().toLowerCase()

  const andParts: Prisma.quotesWhereInput[] = []

  if (statusTrim) {
    andParts.push({ quote_status: { equals: statusTrim, mode: 'insensitive' } })
  }

  if (confTrim === 'high' || confTrim === 'medium' || confTrim === 'low') {
    andParts.push({
      notes: { startsWith: `confidence:${confTrim}`, mode: 'insensitive' },
    })
  }

  if (searchTrim) {
    andParts.push({
      OR: [
        { bookings: { customer_name: { contains: searchTrim, mode: 'insensitive' } } },
        { bookings: { customer_email: { contains: searchTrim, mode: 'insensitive' } } },
        { quote_number: { contains: searchTrim, mode: 'insensitive' } },
      ],
    })
  }

  const where: Prisma.quotesWhereInput = andParts.length > 0 ? { AND: andParts } : {}

  const [quotes, total] = await Promise.all([
    db.quotes.findMany({
      where,
      orderBy: { created_at: 'desc' },
      skip,
      take: per_page,
      select: {
        id: true,
        quote_number: true,
        created_at: true,
        quote_status: true,
        service_type: true,
        total_usd: true,
        deposit_amount_usd: true,
        deposit_percentage: true,
        sent_date: true,
        accepted_date: true,
        expires_date: true,
        notes: true,
        version: true,
        bookings: {
          select: {
            id: true,
            customer_name: true,
            customer_email: true,
            event_date: true,
            service_type: true,
            guest_count: true,
            location: true,
          },
        },
        _count: {
          select: { booking_items: true },
        },
      },
    }),
    db.quotes.count({ where }),
  ])

  const rows = quotes.map((q) => {
    const { confidence: conf, confidence_reason, clean_notes } = parseConfidenceFromNotes(q.notes)

    return {
      id: q.id,
      quote_number: q.quote_number,
      created_at: q.created_at,
      quote_status: q.quote_status,
      service_type: q.service_type,
      total_usd: Number(q.total_usd),
      deposit_amount_usd: Number(q.deposit_amount_usd ?? 0),
      deposit_percentage: q.deposit_percentage,
      sent_date: q.sent_date,
      accepted_date: q.accepted_date,
      expires_date: q.expires_date,
      notes: clean_notes,
      version: q.version,
      item_count: q._count.booking_items,
      confidence: conf,
      confidence_reason,
      booking: q.bookings
        ? {
            id: q.bookings.id,
            customer_name: q.bookings.customer_name,
            customer_email: q.bookings.customer_email,
            event_date: q.bookings.event_date,
            service_type: q.bookings.service_type,
            guest_count: q.bookings.guest_count,
            location: q.bookings.location,
          }
        : null,
    }
  })

  const total_pages = Math.max(1, Math.ceil(total / per_page))

  return NextResponse.json({
    quotes: rows,
    pagination: {
      total,
      page,
      per_page,
      total_pages,
    },
  })
}
