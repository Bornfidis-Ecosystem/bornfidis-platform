export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { createChefStripeAccount, createOnboardingLink } from '@/lib/stripe-connect'

/**
 * Phase 5B: Start Stripe Connect onboarding for chef
 * POST /api/admin/chefs/[id]/start-onboarding
 * 
 * Creates Express account if needed and generates onboarding link
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth()
    const chefId = params.id

    if (!chefId) {
      return NextResponse.json(
        { success: false, error: 'Chef ID is required' },
        { status: 400 }
      )
    }

    // Fetch chef
    const { data: chef, error: fetchError } = await supabaseAdmin
      .from('chefs')
      .select('id, email, name, stripe_connect_account_id, chef_portal_token')
      .eq('id', chefId)
      .single()

    if (fetchError || !chef) {
      return NextResponse.json(
        { success: false, error: 'Chef not found' },
        { status: 404 }
      )
    }

    // Create Stripe Express account if not exists
    let accountId = chef.stripe_connect_account_id
    if (!accountId) {
      const accountResult = await createChefStripeAccount(chef.email, chef.name)
      if (!accountResult.success || !accountResult.accountId) {
        return NextResponse.json(
          { success: false, error: accountResult.error || 'Failed to create Stripe account' },
          { status: 500 }
        )
      }
      accountId = accountResult.accountId

      // Save account ID
      await supabaseAdmin
        .from('chefs')
        .update({
          stripe_connect_account_id: accountId,
          stripe_connect_status: 'pending',
        })
        .eq('id', chefId)
    }

    // Generate onboarding link
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const token = chef.chef_portal_token || chefId // Fallback to chef ID if no token
    const returnUrl = `${siteUrl}/chef/portal/${token}?onboarding=complete`
    const refreshUrl = `${siteUrl}/chef/portal/${token}?onboarding=refresh`

    const linkResult = await createOnboardingLink(accountId, returnUrl, refreshUrl)

    if (!linkResult.success || !linkResult.url) {
      return NextResponse.json(
        { success: false, error: linkResult.error || 'Failed to create onboarding link' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      onboarding_url: linkResult.url,
      account_id: accountId,
      expires_at: linkResult.expiresAt,
    })
  } catch (error: any) {
    console.error('Error starting onboarding:', error)
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to start onboarding' },
      { status: 500 }
    )
  }
}
