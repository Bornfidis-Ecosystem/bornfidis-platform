import { NextRequest, NextResponse } from 'next/server'
import { getCurrentSupabaseUser } from '@/lib/auth'
import { throwAmbiguousStripeDivision } from '@/lib/stripe'

/**
 * POST /api/academy/checkout
 *
 * AMBIGUOUS: Academy is not assigned to 'provisions' | 'digital-studio'.
 * Do not guess which Stripe account to charge — returns 500 until assigned.
 */
export async function POST(_req: NextRequest) {
  const user = await getCurrentSupabaseUser()
  if (!user) {
    return NextResponse.json({ error: 'You must be signed in to purchase' }, { status: 401 })
  }

  try {
    throwAmbiguousStripeDivision(
      'POST /api/academy/checkout — Academy has no assigned Stripe division. ' +
        'Assign Academy to a dedicated account (or explicitly to provisions) before enabling checkout.',
    )
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Ambiguous Stripe division' },
      { status: 500 },
    )
  }
}
