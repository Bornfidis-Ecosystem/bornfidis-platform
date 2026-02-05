export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { createOnboardingLink } from '@/lib/stripe-connect'

/**
 * Phase 5B: Get/create onboarding link for chef portal
 * GET /api/chef/[token]/account-link
 * 
 * Creates a new onboarding link if chef has Stripe account
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const token = params.token

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token is required' },
        { status: 400 }
      )
    }

    // Fetch chef by token
    const { data: chef, error: fetchError } = await supabaseAdmin
      .from('chefs')
      .select('id, stripe_connect_account_id, chef_portal_token')
      .eq('chef_portal_token', token)
      .single()

    if (fetchError || !chef) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 404 }
      )
    }

    if (!chef.stripe_connect_account_id) {
      return NextResponse.json(
        { success: false, error: 'Chef does not have a Stripe account. Please contact admin.' },
        { status: 400 }
      )
    }

    // Generate onboarding link
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const returnUrl = `${siteUrl}/chef/portal/${token}?onboarding=complete`
    const refreshUrl = `${siteUrl}/chef/portal/${token}?onboarding=refresh`

    const linkResult = await createOnboardingLink(
      chef.stripe_connect_account_id,
      returnUrl,
      refreshUrl
    )

    if (!linkResult.success || !linkResult.url) {
      return NextResponse.json(
        { success: false, error: linkResult.error || 'Failed to create onboarding link' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      onboarding_url: linkResult.url,
      expires_at: linkResult.expiresAt,
    })
  } catch (error: any) {
    console.error('Error getting account link:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to get account link' },
      { status: 500 }
    )
  }
}
