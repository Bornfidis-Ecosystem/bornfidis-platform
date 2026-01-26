import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/requireAdmin'
import Stripe from 'stripe'

function getStripe(): Stripe | null {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY
  if (!stripeSecretKey) {
    return null
  }
  return new Stripe(stripeSecretKey, {
    apiVersion: '2024-11-20.acacia',
  })
}

/**
 * Diagnostic endpoint to check Stripe Connect setup
 * GET /api/admin/check-stripe-connect
 */
export async function GET(request: NextRequest) {
  try {
    // Check admin access
    const authError = await requireAdmin(request)
    if (authError) return authError

    const checks: Record<string, { status: 'ok' | 'error' | 'warning'; message: string }> = {}

    // Check STRIPE_SECRET_KEY
    if (!process.env.STRIPE_SECRET_KEY) {
      checks.STRIPE_SECRET_KEY = {
        status: 'error',
        message: 'STRIPE_SECRET_KEY is not set in environment variables',
      }
    } else {
      const keyPrefix = process.env.STRIPE_SECRET_KEY.substring(0, 7)
      checks.STRIPE_SECRET_KEY = {
        status: 'ok',
        message: `Set (${keyPrefix}...) - ${process.env.STRIPE_SECRET_KEY.startsWith('sk_test_') ? 'Test mode' : process.env.STRIPE_SECRET_KEY.startsWith('sk_live_') ? 'Live mode' : 'Unknown format'}`,
      }
    }

    // Check NEXT_PUBLIC_SITE_URL
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

    // Try to create a test account to check Connect
    const stripe = getStripe()
    if (stripe) {
      try {
        // Try to retrieve account info (this will fail if Connect not enabled)
        // We'll try creating a test account instead
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

          // If successful, delete the test account
          await stripe.accounts.del(testAccount.id)

          checks.STRIPE_CONNECT = {
            status: 'ok',
            message: 'Stripe Connect is enabled and working correctly',
          }
        } catch (error: any) {
          if (error.message && error.message.includes('Connect')) {
            checks.STRIPE_CONNECT = {
              status: 'error',
              message: 'Stripe Connect is not enabled. Enable it at https://dashboard.stripe.com/connect',
            }
          } else {
            checks.STRIPE_CONNECT = {
              status: 'warning',
              message: `Could not verify Connect status: ${error.message}`,
            }
          }
        }
      } catch (error: any) {
        checks.STRIPE_CONNECT = {
          status: 'error',
          message: `Error checking Stripe Connect: ${error.message}`,
        }
      }
    } else {
      checks.STRIPE_CONNECT = {
        status: 'error',
        message: 'Cannot check - Stripe client not initialized',
      }
    }

    const allOk = Object.values(checks).every((check) => check.status === 'ok')
    const hasErrors = Object.values(checks).some((check) => check.status === 'error')

    return NextResponse.json({
      success: allOk,
      checks,
      summary: {
        allOk,
        hasErrors,
        message: allOk
          ? 'All checks passed! Stripe Connect is ready.'
          : hasErrors
          ? 'Some checks failed. Please fix the errors above.'
          : 'Some warnings detected. Review the checks above.',
      },
    })
  } catch (error: any) {
    console.error('Error checking Stripe Connect:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to check Stripe Connect setup',
      },
      { status: 500 }
    )
  }
}
