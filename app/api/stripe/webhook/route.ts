import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { sendInvoiceEmail } from '@/lib/email'
import { formatUSD } from '@/lib/money'
import { tryPayoutForBooking } from '@/lib/payout-engine'
import { tryPayoutsForBooking } from '@/lib/farmer-payout-engine'
import { tryPayoutsForBookingIngredients } from '@/lib/ingredient-payout-engine'
import { recordBookingImpact } from '@/lib/impact-tracker'
import { getAccountStatus } from '@/lib/stripe-connect'
import Stripe from 'stripe'

/**
 * Phase 3A + 3B: Stripe Webhook Handler
 * POST /api/stripe/webhook
 * 
 * Handles checkout.session.completed event
 * - Phase 3A: Deposit payments (metadata.kind === 'deposit')
 * - Phase 3B: Balance payments (metadata.kind === 'balance')
 */
export async function POST(request: NextRequest) {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

    if (!stripeSecretKey) {
        console.error('STRIPE_SECRET_KEY is not set')
        return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 })
    }

    if (!webhookSecret) {
        console.error('STRIPE_WEBHOOK_SECRET is not set')
        return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
    }

    const stripe = new Stripe(stripeSecretKey, {
        apiVersion: '2024-11-20.acacia',
    })

    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
        return NextResponse.json({ error: 'No signature' }, { status: 400 })
    }

    let event: Stripe.Event

    try {
        // Verify webhook signature
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err: any) {
        console.error('Webhook signature verification failed:', err.message)
        return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
    }

    // Handle the event
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session

        // Check metadata for payment type (Phase 3C uses payment_type)
        const paymentType = session.metadata?.payment_type || session.metadata?.kind || session.metadata?.type
        const bookingId = session.metadata?.booking_id

        if (!bookingId) {
            console.log('Skipping session without booking_id')
            return NextResponse.json({ received: true })
        }

        const paymentIntentId = session.payment_intent as string

        try {
            if (paymentType === 'deposit' || paymentType === 'Deposit') {
                // Phase 3A: Deposit payment
                const { error: updateError } = await supabaseAdmin
                    .from('booking_inquiries')
                    .update({
                        stripe_payment_intent_id: paymentIntentId,
                        status: 'booked',
                        paid_at: new Date().toISOString(),
                        // deposit_amount_cents should already be set from create-deposit-session
                    })
                    .eq('id', bookingId)

                if (updateError) {
                    console.error('Error updating booking after deposit payment:', updateError)
                    return NextResponse.json(
                        { error: 'Failed to update booking' },
                        { status: 500 }
                    )
                }

                console.log(`✅ Deposit payment completed for booking ${bookingId}`)
            } else if (paymentType === 'balance') {
                // Phase 4A: Balance payment - mark as paid and send invoice
                const now = new Date().toISOString()

                // Fetch booking data for invoice email
                const { data: booking, error: fetchError } = await supabaseAdmin
                    .from('booking_inquiries')
                    .select('id, name, email, quote_total_cents, deposit_amount_cents, balance_amount_cents, paid_at, invoice_pdf_url')
                    .eq('id', bookingId)
                    .single()

                if (fetchError) {
                    console.error('Error fetching booking for balance payment:', fetchError)
                    return NextResponse.json(
                        { error: 'Failed to fetch booking' },
                        { status: 500 }
                    )
                }

                // Update booking with balance payment details (Phase 4A)
                const updateData: any = {
                    stripe_balance_payment_intent_id: paymentIntentId,
                    balance_paid_at: now,
                    fully_paid_at: now,
                    paid_at: now, // Phase 4A: Mark paid_at when balance is paid
                }

                const { error: updateError } = await supabaseAdmin
                    .from('booking_inquiries')
                    .update(updateData)
                    .eq('id', bookingId)

                if (updateError) {
                    console.error('Error updating booking after balance payment:', updateError)
                    return NextResponse.json(
                        { error: 'Failed to update booking' },
                        { status: 500 }
                    )
                }

                console.log(`✅ Balance payment completed for booking ${bookingId}`)
                console.log(`✅ Booking ${bookingId} is now fully paid`)

                // Phase 5B: Trigger chef payout if eligible
                try {
                    const payoutResult = await tryPayoutForBooking(bookingId)
                    if (payoutResult.success && payoutResult.payoutCreated) {
                        console.log(`✅ Chef payout processed for booking ${bookingId}: ${payoutResult.transferId}`)
                    } else if (payoutResult.blockers && payoutResult.blockers.length > 0) {
                        console.log(`⚠️  Chef payout blocked for booking ${bookingId}: ${payoutResult.blockers.join(', ')}`)
                    } else {
                        console.log(`ℹ️  Chef payout not applicable or already processed for booking ${bookingId}`)
                    }
                } catch (payoutError: any) {
                    console.error('Error processing chef payout after balance payment:', payoutError)
                    // Don't fail the webhook if payout fails - can be retried manually
                }

                // Phase 6A: Trigger farmer payouts if eligible
                try {
                    const farmerPayoutsResult = await tryPayoutsForBooking(bookingId)
                    if (farmerPayoutsResult.success && farmerPayoutsResult.farmerPayouts.length > 0) {
                        const successful = farmerPayoutsResult.farmerPayouts.filter(p => p.success)
                        const failed = farmerPayoutsResult.farmerPayouts.filter(p => !p.success)
                        if (successful.length > 0) {
                            console.log(`✅ ${successful.length} farmer payout(s) processed for booking ${bookingId}`)
                        }
                        if (failed.length > 0) {
                            console.log(`⚠️  ${failed.length} farmer payout(s) failed for booking ${bookingId}`)
                        }
                    }
                } catch (farmerPayoutError: any) {
                    console.error('Error processing farmer payouts after balance payment:', farmerPayoutError)
                    // Don't fail the webhook if payout fails - can be retried manually
                }

                // Phase 6B: Trigger ingredient payouts if eligible
                try {
                    const ingredientPayoutsResult = await tryPayoutsForBookingIngredients(bookingId)
                    if (ingredientPayoutsResult.success && ingredientPayoutsResult.ingredientPayouts.length > 0) {
                        const successful = ingredientPayoutsResult.ingredientPayouts.filter(p => p.success)
                        const failed = ingredientPayoutsResult.ingredientPayouts.filter(p => !p.success)
                        if (successful.length > 0) {
                            console.log(`✅ ${successful.length} ingredient payout(s) processed for booking ${bookingId}`)
                        }
                        if (failed.length > 0) {
                            console.log(`⚠️  ${failed.length} ingredient payout(s) failed for booking ${bookingId}`)
                        }
                    }
                } catch (ingredientPayoutError: any) {
                    console.error('Error processing ingredient payouts after balance payment:', ingredientPayoutError)
                    // Don't fail the webhook if payout fails - can be retried manually
                }

                // Phase 6C: Record impact events when booking completes
                try {
                    const impactResult = await recordBookingImpact(bookingId)
                    if (impactResult.success) {
                        console.log(`✅ Phase 6C: Recorded ${impactResult.events_recorded} impact events for booking ${bookingId}`)
                    } else {
                        console.error(`⚠️  Phase 6C: Failed to record impact for booking ${bookingId}: ${impactResult.error}`)
                    }
                } catch (impactError: any) {
                    console.error('Error recording booking impact:', impactError)
                    // Don't fail the webhook if impact recording fails
                }

                // Phase 4A: Send invoice email to customer
                if (booking?.email && booking.name) {
                    try {
                        const invoiceNumber = bookingId.slice(0, 8).toUpperCase()
                        const invoiceDate = new Date().toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                        })

                        const emailResult = await sendInvoiceEmail(booking.email, booking.name, {
                            bookingId: bookingId,
                            invoiceNumber,
                            invoiceDate,
                            totalAmount: formatUSD(booking.quote_total_cents || 0),
                            depositPaid: formatUSD(booking.deposit_amount_cents || 0),
                            balancePaid: formatUSD(booking.balance_amount_cents || 0),
                            invoicePdfUrl: booking.invoice_pdf_url || undefined,
                        })

                        if (emailResult.success) {
                            console.log(`✅ Invoice email sent to ${booking.email}`)
                        } else {
                            console.warn(`⚠️  Failed to send invoice email: ${emailResult.error}`)
                            // Don't fail the webhook if email fails
                        }
                    } catch (emailError: any) {
                        console.error('Error sending invoice email:', emailError)
                        // Don't fail the webhook if email fails
                    }
                }
            } else {
                console.log(`Skipping session with unknown payment type: ${paymentType}`)
                return NextResponse.json({ received: true })
            }
        } catch (error: any) {
            console.error('Error processing payment webhook:', error)
            return NextResponse.json(
                { error: error.message || 'Failed to process payment' },
                { status: 500 }
            )
        }
    } else if (event.type === 'account.updated') {
        // Phase 5B: Handle Stripe Connect account updates
        const account = event.data.object as Stripe.Account

        try {
            // Find chef by Stripe account ID (check both fields for backward compatibility)
            const { data: chef, error: chefError } = await supabaseAdmin
                .from('chefs')
                .select('id, stripe_connect_account_id, stripe_account_id, status, stripe_onboarded_at')
                .or(`stripe_connect_account_id.eq.${account.id},stripe_account_id.eq.${account.id}`)
                .single()

            if (chefError || !chef) {
                console.log(`No chef found for Stripe account ${account.id}`)
                return NextResponse.json({ received: true })
            }

            // Phase 5B: Determine Connect status based on details_submitted and charges_enabled/payouts_enabled
            let connectStatus: 'not_connected' | 'pending' | 'connected' | 'restricted' = 'pending'
            let payoutsEnabled = false
            let onboardingComplete = false
            let onboardedAt: string | null = null

            // Check if onboarding is complete: details_submitted AND (charges_enabled OR payouts_enabled)
            if (account.details_submitted) {
                if (account.charges_enabled && account.payouts_enabled) {
                    connectStatus = 'connected'
                    payoutsEnabled = true
                    onboardingComplete = true
                } else if (account.charges_enabled || account.payouts_enabled) {
                    // Partially enabled
                    connectStatus = 'pending'
                    payoutsEnabled = account.payouts_enabled || false
                    onboardingComplete = true
                } else {
                    // Details submitted but not enabled
                    connectStatus = 'restricted'
                }
            }

            // Set onboarded_at when onboarding completes
            if (onboardingComplete && !chef.stripe_onboarded_at) {
                onboardedAt = new Date().toISOString()
            }

            // Update chef status
            const updateData: any = {
                stripe_connect_status: connectStatus,
                payouts_enabled: payoutsEnabled,
                stripe_onboarding_complete: onboardingComplete, // Legacy field
            }

            if (onboardedAt) {
                updateData.stripe_onboarded_at = onboardedAt
                // Auto-update chef status to active if approved
                if (chef.status === 'approved') {
                    updateData.status = 'active'
                }
            }

            const { error: updateError } = await supabaseAdmin
                .from('chefs')
                .update(updateData)
                .eq('id', chef.id)

            if (updateError) {
                console.error('Error updating chef Connect status:', updateError)
            } else {
                console.log(`✅ Updated chef ${chef.id}: status=${connectStatus}, payouts_enabled=${payoutsEnabled}, onboarding_complete=${onboardingComplete}`)
            }
        } catch (error: any) {
            console.error('Error processing account.updated webhook:', error)
            // Don't fail the webhook
        }
    } else {
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
}
