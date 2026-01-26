import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { createOnboardingLink } from '@/lib/stripe-connect'
import { supabaseAdmin } from '@/lib/supabase'
import { sendChefOnboardingEmail } from '@/lib/email'

/**
 * Phase 5B: Create Stripe Connect onboarding link
 * POST /api/stripe/connect/create-onboarding-link
 * 
 * Creates an onboarding link for a chef's Stripe account
 */
export async function POST(request: NextRequest) {
  try {
    await requireAuth()

    // Validate environment variables
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { success: false, error: 'STRIPE_SECRET_KEY is not configured' },
        { status: 500 }
      )
    }

    if (!process.env.NEXT_PUBLIC_SITE_URL) {
      return NextResponse.json(
        { success: false, error: 'NEXT_PUBLIC_SITE_URL is not configured' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { chef_id, send_email } = body

    if (!chef_id) {
      return NextResponse.json(
        { success: false, error: 'chef_id is required' },
        { status: 400 }
      )
    }

    // Fetch chef
    const { data: chef, error: chefError } = await supabaseAdmin
      .from('chefs')
      .select('id, email, name, stripe_connect_account_id, chef_portal_token')
      .eq('id', chef_id)
      .single()

    if (chefError || !chef) {
      return NextResponse.json(
        { success: false, error: 'Chef not found' },
        { status: 404 }
      )
    }

    if (!chef.stripe_connect_account_id) {
      return NextResponse.json(
        { success: false, error: 'Chef does not have a Stripe account. Create account first.' },
        { status: 400 }
      )
    }

    // Generate onboarding link
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
    const portalToken = chef.chef_portal_token || chef_id
    const returnUrl = `${siteUrl}/chef/portal/${portalToken}?onboarding=complete`
    const refreshUrl = `${siteUrl}/chef/portal/${portalToken}?onboarding=refresh`

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

    // Update chef record with link
    await supabaseAdmin
      .from('chefs')
      .update({
        stripe_onboarding_link: linkResult.url,
        stripe_onboarding_link_expires_at: linkResult.expiresAt,
      })
      .eq('id', chef_id)

    // Send email if requested and configured
    if (send_email && chef.email) {
      try {
        await sendChefOnboardingEmail(chef.email, chef.name, {
          onboarding_url: linkResult.url,
          chef_name: chef.name,
        })
      } catch (emailError: any) {
        console.warn('Failed to send onboarding email:', emailError)
        // Don't fail the request if email fails
      }
    }

    return NextResponse.json({
      success: true,
      onboarding_url: linkResult.url,
      expires_at: linkResult.expiresAt,
      email_sent: send_email && chef.email ? true : false,
    })
  } catch (error: any) {
    console.error('Error creating onboarding link:', error)
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create onboarding link' },
      { status: 500 }
    )
  }
}
