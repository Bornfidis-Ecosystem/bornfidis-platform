export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { db } from '@/lib/db'
import { Prisma } from '@prisma/client'

/**
 * Phase 2M: ProJu Marketplace Demand Signal
 * GET /api/admin/proju/demand-signal
 * 
 * Read-only demand signal using raw SQL against booking_ingredients.
 * Returns ingredient name, total quantity requested, booking count, and last requested date
 * for the last 60 days.
 * 
 * No automation - manual visibility only.
 */
export async function GET(request: NextRequest) {
  try {
    await requireAuth()

    // Raw SQL query for demand signal aggregation
    // Filters last 60 days, groups by ingredient, aggregates quantities and booking counts
    // Uses unit from ingredients table (canonical unit per ingredient)
    const demandSignal = await db.$queryRaw<
      Array<{
        ingredient_name: string
        total_quantity: number
        booking_count: number
        last_requested_date: Date
        unit: string
      }>
    >(Prisma.sql`
      SELECT 
        i.name AS ingredient_name,
        SUM(bi.quantity) AS total_quantity,
        COUNT(DISTINCT bi.booking_id) AS booking_count,
        MAX(bi.created_at) AS last_requested_date,
        i.unit
      FROM booking_ingredients bi
      INNER JOIN ingredients i ON bi.ingredient_id = i.id
      WHERE bi.created_at >= NOW() - INTERVAL '60 days'
      GROUP BY i.id, i.name, i.unit
      ORDER BY total_quantity DESC, last_requested_date DESC
    `)

    return NextResponse.json({
      success: true,
      period_days: 60,
      generated_at: new Date().toISOString(),
      demand_signal: demandSignal.map((row) => ({
        ingredient_name: row.ingredient_name,
        total_quantity: Number(row.total_quantity),
        booking_count: Number(row.booking_count),
        last_requested_date: row.last_requested_date.toISOString(),
        unit: row.unit,
      })),
    })
  } catch (error: any) {
    console.error('Error fetching ProJu demand signal:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch demand signal',
      },
      { status: 500 }
    )
  }
}
