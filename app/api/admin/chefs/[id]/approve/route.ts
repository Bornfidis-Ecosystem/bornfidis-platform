export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { createChefStripeAccount, createOnboardingLink } from '@/lib/stripe-connect'

/**
 * Phase 5A: Approve chef application
 * POST /api/admin/chefs/[id]/approve
 * 
 * Approves chef and creates Stripe Express account
 */
export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = await requireAuth()
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
            .select('id, email, name, status, stripe_account_id')
            .eq('id', chefId)
            .single()

        if (fetchError || !chef) {
            return NextResponse.json(
                { success: false, error: 'Chef not found' },
                { status: 404 }
            )
        }

        if (chef.status !== 'pending') {
            return NextResponse.json(
                { success: false, error: `Chef is already ${chef.status}` },
                { status: 400 }
            )
        }

        // Phase 5B: Create Stripe Express account if not exists
        let stripeAccountId = chef.stripe_connect_account_id || chef.stripe_account_id
        if (!stripeAccountId) {
            // Validate Stripe is configured
            if (!process.env.STRIPE_SECRET_KEY) {
                return NextResponse.json(
                    { success: false, error: 'STRIPE_SECRET_KEY is not configured' },
                    { status: 500 }
                )
            }

            const accountResult = await createChefStripeAccount(chef.email, chef.name)
            if (!accountResult.success || !accountResult.accountId) {
                // Return the specific error message from Stripe
                const errorMessage = accountResult.error || 'Failed to create Stripe account'
                console.error('Stripe account creation failed:', errorMessage)
                return NextResponse.json(
                    { success: false, error: errorMessage },
                    { status: 500 }
                )
            }
            stripeAccountId = accountResult.accountId
        }

        // Phase 5B: Validate NEXT_PUBLIC_SITE_URL
        if (!process.env.NEXT_PUBLIC_SITE_URL) {
            return NextResponse.json(
                { success: false, error: 'NEXT_PUBLIC_SITE_URL is not configured' },
                { status: 500 }
            )
        }

        // Phase 5B: Create onboarding link with portal token
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
        const portalToken = chef.chef_portal_token || chefId // Fallback
        const returnUrl = `${siteUrl}/chef/portal/${portalToken}?onboarding=complete`
        const refreshUrl = `${siteUrl}/chef/portal/${portalToken}?onboarding=refresh`

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

        // Phase 5B: Update chef status with new fields
        const { error: updateError } = await supabaseAdmin
            .from('chefs')
            .update({
                status: 'approved',
                approved_at: new Date().toISOString(),
                approved_by: user.id,
                stripe_connect_account_id: stripeAccountId,
                stripe_account_id: stripeAccountId, // Keep for backward compatibility
                stripe_connect_status: 'pending',
                stripe_account_status: 'onboarding', // Legacy
                stripe_onboarding_link: onboardingResult.url, // Legacy
                stripe_onboarding_link_expires_at: onboardingResult.expiresAt, // Legacy
            })
            .eq('id', chefId)

        if (updateError) {
            console.error('Error updating chef:', updateError)
            return NextResponse.json(
                { success: false, error: 'Failed to update chef status' },
                { status: 500 }
            )
        }

        return NextResponse.json({
            success: true,
            message: 'Chef approved successfully',
            onboarding_url: onboardingResult.url,
        })
    } catch (error: any) {
        console.error('Error approving chef:', error)
        if (error.message === 'Unauthorized') {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            )
        }
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to approve chef' },
            { status: 500 }
        )
    }
}
