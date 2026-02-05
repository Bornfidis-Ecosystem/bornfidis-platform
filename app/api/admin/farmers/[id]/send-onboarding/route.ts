export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { createOnboardingLink } from '@/lib/stripe-connect'

/**
 * Phase 6A: Send Stripe onboarding link to farmer
 * POST /api/admin/farmers/[id]/send-onboarding
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth()
    const farmerId = params.id

    // Fetch farmer
    const { data: farmer, error: fetchError } = await supabaseAdmin
      .from('farmers')
      .select('id, stripe_account_id, farmer_portal_token')
      .eq('id', farmerId)
      .single()

    if (fetchError || !farmer) {
      return NextResponse.json(
        { success: false, error: 'Farmer not found' },
        { status: 404 }
      )
    }

    if (!farmer.stripe_account_id) {
      return NextResponse.json(
        { success: false, error: 'Farmer does not have a Stripe account. Please approve first.' },
        { status: 400 }
      )
    }

    if (!process.env.NEXT_PUBLIC_SITE_URL) {
      return NextResponse.json(
        { success: false, error: 'NEXT_PUBLIC_SITE_URL is not configured' },
        { status: 500 }
      )
    }

    // Create onboarding link
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
    const portalToken = farmer.farmer_portal_token || farmerId
    const returnUrl = `${siteUrl}/farmer/portal/${portalToken}?onboarding=complete`
    const refreshUrl = `${siteUrl}/farmer/portal/${portalToken}?onboarding=refresh`

    const onboardingResult = await createOnboardingLink(
      farmer.stripe_account_id,
      returnUrl,
      refreshUrl
    )

    if (!onboardingResult.success || !onboardingResult.url) {
      return NextResponse.json(
        { success: false, error: onboardingResult.error || 'Failed to create onboarding link' },
        { status: 500 }
      )
    }

    // TODO: Send email with onboarding link (Phase 6B)
    // For now, return the URL for admin to share

    return NextResponse.json({
      success: true,
      message: 'Onboarding link created',
      onboarding_url: onboardingResult.url,
    })
  } catch (error: any) {
    console.error('Error sending onboarding link:', error)
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to send onboarding link' },
      { status: 500 }
    )
  }
}
