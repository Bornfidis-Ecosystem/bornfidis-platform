import { NextRequest, NextResponse } from 'next/server'
import { throwAmbiguousStripeDivision } from '@/lib/stripe'

/**
 * Phase A — Academy Stripe webhook
 * POST /api/webhooks/academy
 *
 * AMBIGUOUS: Academy is not assigned to 'provisions' | 'digital-studio'.
 * Do not guess which Stripe account signed this webhook — returns 500 until assigned.
 *
 * When Academy is assigned, restore signature verification with that account's
 * secret + STRIPE_ACADEMY_WEBHOOK_SECRET (or a dedicated academy webhook secret).
 */
export async function POST(_req: NextRequest) {
  try {
    throwAmbiguousStripeDivision(
      'POST /api/webhooks/academy — Academy has no assigned Stripe division. ' +
        'Assign Academy before enabling this webhook (or point it at an explicit account).',
    )
  } catch (e) {
    console.error(e instanceof Error ? e.message : e)
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Ambiguous Stripe division' },
      { status: 500 },
    )
  }
}
