/**
 * Phase 5A/5B: Stripe Connect integration for chef partners
 * Handles Express account creation, onboarding, and payouts
 */

import Stripe from 'stripe'

let stripeInstance: Stripe | null = null

export function getStripe(): Stripe | null {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY
    if (!stripeSecretKey) {
        return null
    }

    if (!stripeInstance) {
        stripeInstance = new Stripe(stripeSecretKey, {
            apiVersion: '2024-11-20.acacia',
        })
    }

    return stripeInstance
}

/**
 * Create a Stripe Express account for a chef
 */
export async function createChefStripeAccount(chefEmail: string, chefName: string): Promise<{
    success: boolean
    accountId?: string
    error?: string
}> {
    const stripe = getStripe()
    if (!stripe) {
        return { success: false, error: 'Stripe is not configured' }
    }

    try {
        const account = await stripe.accounts.create({
            type: 'express',
            country: 'US', // TODO: Make configurable
            email: chefEmail,
            capabilities: {
                card_payments: { requested: true },
                transfers: { requested: true },
            },
            business_type: 'individual', // TODO: Support business accounts
            metadata: {
                chef_name: chefName,
            },
        })

        return {
            success: true,
            accountId: account.id,
        }
    } catch (error: any) {
        console.error('Error creating Stripe Express account:', error)
        console.error('Error type:', error.type)
        console.error('Error code:', error.code)
        console.error('Error message:', error.message)
        console.error('Full error:', JSON.stringify(error, null, 2))

        // Extract user-friendly error message
        let errorMessage = 'Failed to create Stripe account'

        // Check for Stripe-specific error types
        if (error.type === 'StripeInvalidRequestError' || error.type === 'StripeAPIError') {
            // Check for Connect-related errors
            const errorMsg = error.message || ''
            if (errorMsg.includes('Connect') || errorMsg.includes('connect')) {
                errorMessage = 'Stripe Connect is not enabled on your account. Please enable Stripe Connect in your Stripe Dashboard (https://dashboard.stripe.com/connect) before creating chef accounts.'
            } else if (errorMsg) {
                errorMessage = errorMsg
            }
        } else if (error.message) {
            errorMessage = error.message
        }

        return {
            success: false,
            error: errorMessage,
        }
    }
}

/**
 * Phase 5B: Create onboarding link for Stripe Express account
 * Supports refresh_url for re-onboarding
 */
export async function createOnboardingLink(
    accountId: string,
    returnUrl: string,
    refreshUrl?: string
): Promise<{
    success: boolean
    url?: string
    expiresAt?: string
    error?: string
}> {
    const stripe = getStripe()
    if (!stripe) {
        return { success: false, error: 'Stripe is not configured' }
    }

    try {
        const accountLink = await stripe.accountLinks.create({
            account: accountId,
            refresh_url: refreshUrl || returnUrl,
            return_url: returnUrl,
            type: 'account_onboarding',
        })

        // Links expire in 24 hours
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

        return {
            success: true,
            url: accountLink.url,
            expiresAt,
        }
    } catch (error: any) {
        console.error('Error creating onboarding link:', error)
        return {
            success: false,
            error: error.message || 'Failed to create onboarding link',
        }
    }
}

/**
 * Phase 5B: Get account status with detailed Connect status
 */
export async function getAccountStatus(accountId: string): Promise<{
    success: boolean
    connectStatus?: 'not_connected' | 'pending' | 'connected' | 'restricted'
    detailsSubmitted?: boolean
    chargesEnabled?: boolean
    payoutsEnabled?: boolean
    error?: string
}> {
    const stripe = getStripe()
    if (!stripe) {
        return { success: false, error: 'Stripe is not configured' }
    }

    try {
        const account = await stripe.accounts.retrieve(accountId)

        // Determine Connect status
        let connectStatus: 'not_connected' | 'pending' | 'connected' | 'restricted' = 'pending'
        if (account.charges_enabled && account.payouts_enabled) {
            connectStatus = 'connected'
        } else if (account.details_submitted && !account.payouts_enabled) {
            connectStatus = 'restricted'
        } else if (account.details_submitted) {
            connectStatus = 'pending'
        }

        return {
            success: true,
            connectStatus,
            detailsSubmitted: account.details_submitted,
            chargesEnabled: account.charges_enabled,
            payoutsEnabled: account.payouts_enabled,
        }
    } catch (error: any) {
        console.error('Error retrieving account status:', error)
        return {
            success: false,
            error: error.message || 'Failed to retrieve account status',
        }
    }
}

/**
 * Create a transfer/payout to chef's Stripe account
 */
export async function createChefPayout(
    accountId: string,
    amountCents: number,
    description: string
): Promise<{
    success: boolean
    transferId?: string
    error?: string
}> {
    const stripe = getStripe()
    if (!stripe) {
        return { success: false, error: 'Stripe is not configured' }
    }

    try {
        const transfer = await stripe.transfers.create({
            amount: amountCents,
            currency: 'usd',
            destination: accountId,
            description,
        })

        return {
            success: true,
            transferId: transfer.id,
        }
    } catch (error: any) {
        console.error('Error creating chef payout:', error)
        return {
            success: false,
            error: error.message || 'Failed to create payout',
        }
    }
}
