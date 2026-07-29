export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/requireAdmin'
import { getStripeClient, isStripeConfigured } from '@/lib/stripe'

/**
 * Diagnostic endpoint to check Stripe Connect setup (Provisions account)
 * GET /api/admin/check-stripe-connect
 */
export async function GET(request: NextRequest) {
  try {
    const authError = await requireAdmin(request)
    if (authError) return authError

    const checks: Record<string, { status: 'ok' | 'error' | 'warning'; message: string }> = {}

    const provisionsKey =
      process.env.STRIPE_PROVISIONS_SECRET_KEY?.trim() ||
      process.env.STRIPE_SECRET_KEY?.trim()

    if (!provisionsKey) {
      checks.STRIPE_PROVISIONS_SECRET_KEY = {
        status: 'error',
        message: 'STRIPE_PROVISIONS_SECRET_KEY (or legacy STRIPE_SECRET_KEY) is not set',
      }
    } else {
      const keyPrefix = provisionsKey.substring(0, 7)
      checks.STRIPE_PROVISIONS_SECRET_KEY = {
        status: 'ok',
        message: `Set (${keyPrefix}...) - ${
          provisionsKey.startsWith('sk_test_')
            ? 'Test mode'
            : provisionsKey.startsWith('sk_live_')
              ? 'Live mode'
              : 'Unknown format'
        }`,
      }
    }

    if (!process.env.NEXT_PUBLIC_SITE_URL) {
      checks.NEXT_PUBLIC_SITE_URL = {
        status: 'error',
        message: 'NEXT_PUBLIC_SITE_URL is not set',
      }
    } else {
      checks.NEXT_PUBLIC_SITE_URL = {
        status: 'ok',
        message: `Set to: ${process.env.NEXT_PUBLIC_SITE_URL}`,
      }
    }

    if (isStripeConfigured('provisions')) {
      try {
        const stripe = getStripeClient('provisions')
        try {
          const testAccount = await stripe.accounts.create({
            type: 'express',
            country: 'US',
            email: 'test@example.com',
            capabilities: {
              card_payments: { requested: true },
              transfers: { requested: true },
            },
          })
          await stripe.accounts.del(testAccount.id)
          checks.STRIPE_CONNECT = {
            status: 'ok',
            message: 'Stripe Connect is enabled on the Provisions account',
          }
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : 'Unknown error'
          checks.STRIPE_CONNECT = {
            status: 'error',
            message: `Connect check failed: ${message}`,
          }
        }
      } catch (error: unknown) {
        checks.STRIPE_CLIENT = {
          status: 'error',
          message: error instanceof Error ? error.message : 'Failed to init Stripe client',
        }
      }
    }

    const hasError = Object.values(checks).some((c) => c.status === 'error')
    return NextResponse.json({ success: !hasError, checks })
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Check failed' },
      { status: 500 },
    )
  }
}
