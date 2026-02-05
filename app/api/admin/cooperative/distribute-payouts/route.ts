export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { distributeCooperativePayouts } from '@/lib/cooperative-payout-engine'

/**
 * Phase 7A: Distribute cooperative payouts
 * POST /api/admin/cooperative/distribute-payouts
 */
export async function POST(request: NextRequest) {
  try {
    await requireAuth()

    const body = await request.json()
    const { period, period_type, total_profit_cents } = body

    if (!period || !period_type || !total_profit_cents) {
      return NextResponse.json(
        { success: false, error: 'Period, period_type, and total_profit_cents are required' },
        { status: 400 }
      )
    }

    if (total_profit_cents <= 0) {
      return NextResponse.json(
        { success: false, error: 'Total profit must be positive' },
        { status: 400 }
      )
    }

    const result = await distributeCooperativePayouts(
      period,
      period_type,
      total_profit_cents
    )

    if (result.success) {
      return NextResponse.json({
        success: true,
        payouts_created: result.payouts_created,
        payouts_paid: result.payouts_paid,
        errors: result.errors.length > 0 ? result.errors : undefined,
      })
    } else {
      return NextResponse.json(
        { success: false, error: result.errors.join(', ') || 'Failed to distribute payouts' },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error('Error distributing payouts:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to distribute payouts' },
      { status: 500 }
    )
  }
}
