import { NextRequest } from 'next/server'

/**
 * @deprecated Prefer POST /api/stripe/provisions/webhook
 *
 * Legacy endpoint kept so existing Stripe Dashboard webhook URLs keep working.
 * Delegates to the Provisions handler (same account as STRIPE_SECRET_KEY historically).
 */
export async function POST(request: NextRequest) {
  const { POST: provisionsPost } = await import('../provisions/webhook/route')
  return provisionsPost(request)
}
