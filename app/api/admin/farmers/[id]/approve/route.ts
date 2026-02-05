export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { createChefStripeAccount, createOnboardingLink } from '@/lib/stripe-connect'

/**
 * Phase 6A: Approve farmer application
 * POST /api/admin/farmers/[id]/approve
 * 
 * Approves farmer and creates Stripe Express account
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()
    const farmerId = params.id

    if (!farmerId) {
      return NextResponse.json(
        { success: false, error: 'Farmer ID is required' },
        { status: 400 }
      )
    }

    // Fetch farmer
    const { data: farmer, error: fetchError } = await supabaseAdmin
      .from('farmers')
      .select('id, email, name, status, stripe_account_id, farmer_portal_token')
      .eq('id', farmerId)
      .single()

    if (fetchError || !farmer) {
      return NextResponse.json(
        { success: false, error: 'Farmer not found' },
        { status: 404 }
      )
    }

    if (farmer.status !== 'pending') {
      return NextResponse.json(
        { success: false, error: `Farmer is already ${farmer.status}` },
        { status: 400 }
      )
    }

    // Create Stripe Express account if not exists
    let stripeAccountId = farmer.stripe_account_id
    if (!stripeAccountId) {
      if (!process.env.STRIPE_SECRET_KEY) {
        return NextResponse.json(
          { success: false, error: 'STRIPE_SECRET_KEY is not configured' },
          { status: 500 }
        )
      }

      const accountResult = await createChefStripeAccount(farmer.email, farmer.name)
      if (!accountResult.success || !accountResult.accountId) {
        return NextResponse.json(
          { success: false, error: accountResult.error || 'Failed to create Stripe account' },
          { status: 500 }
        )
      }
      stripeAccountId = accountResult.accountId
    }

    // Validate NEXT_PUBLIC_SITE_URL
    if (!process.env.NEXT_PUBLIC_SITE_URL) {
      return NextResponse.json(
        { success: false, error: 'NEXT_PUBLIC_SITE_URL is not configured' },
        { status: 500 }
      )
    }

    // Create onboarding link with portal token
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
    const portalToken = farmer.farmer_portal_token || farmerId
    const returnUrl = `${siteUrl}/farmer/portal/${portalToken}?onboarding=complete`
    const refreshUrl = `${siteUrl}/farmer/portal/${portalToken}?onboarding=refresh`

    const onboardingResult = await createOnboardingLink(
      stripeAccountId,
      returnUrl,
      refreshUrl
    )

    if (!onboardingResult.success || !onboardingResult.url) {
      return NextResponse.json(
        { success: false, error: onboardingResult.error || 'Failed to create onboarding link' },
        { status: 500 }
      )
    }

    // Update farmer status
    const { error: updateError } = await supabaseAdmin
      .from('farmers')
      .update({
        status: 'approved',
        approved_at: new Date().toISOString(),
        approved_by: user.id,
        stripe_account_id: stripeAccountId,
        stripe_connect_status: 'pending',
      })
      .eq('id', farmerId)

    if (updateError) {
      console.error('Error updating farmer:', updateError)
      return NextResponse.json(
        { success: false, error: 'Failed to update farmer status' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Farmer approved successfully',
      onboarding_url: onboardingResult.url,
    })
  } catch (error: any) {
    console.error('Error approving farmer:', error)
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to approve farmer' },
      { status: 500 }
    )
  }
}
