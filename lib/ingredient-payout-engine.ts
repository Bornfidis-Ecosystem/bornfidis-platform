/**
 * Phase 6B: Ingredient Payout Engine
 * Handles idempotent ingredient payouts via Stripe Connect Transfers
 */

import { supabaseAdmin } from '@/lib/supabase'
import { createChefPayout, getAccountStatus } from './stripe-connect'

/**
 * Phase 6B: Attempt payout for a booking ingredient
 * Idempotent - will not create duplicate payouts
 */
export async function tryPayoutForBookingIngredient(bookingIngredientId: string): Promise<{
  success: boolean
  payoutCreated?: boolean
  transferId?: string
  error?: string
  blockers?: string[]
}> {
  try {
    // Fetch booking ingredient
    const { data: bookingIngredient, error: bookingIngredientError } = await supabaseAdmin
      .from('booking_ingredients')
      .select(`
        id,
        booking_id,
        ingredient_id,
        farmer_id,
        total_cents,
        payout_status,
        transfer_id,
        fulfillment_status
      `)
      .eq('id', bookingIngredientId)
      .single()

    if (bookingIngredientError || !bookingIngredient) {
      return {
        success: false,
        error: 'Booking ingredient not found',
      }
    }

    // Check if already paid
    if (bookingIngredient.payout_status === 'paid' || bookingIngredient.transfer_id) {
      return {
        success: true,
        payoutCreated: false,
        error: 'Payout already completed',
      }
    }

    // Check if on hold
    if (bookingIngredient.payout_status === 'on_hold') {
      return {
        success: true,
        payoutCreated: false,
        blockers: ['Payout is on hold'],
      }
    }

    // Check fulfillment status - must be delivered or paid
    if (bookingIngredient.fulfillment_status !== 'delivered' && bookingIngredient.fulfillment_status !== 'paid') {
      return {
        success: true,
        payoutCreated: false,
        blockers: [`Ingredient not delivered (status: ${bookingIngredient.fulfillment_status})`],
      }
    }

    // Fetch booking to check payment and completion status
    const { data: booking, error: bookingError } = await supabaseAdmin
      .from('booking_inquiries')
      .select(`
        id,
        name,
        fully_paid_at,
        job_completed_at,
        payout_hold
      `)
      .eq('id', bookingIngredient.booking_id)
      .single()

    if (bookingError || !booking) {
      return { success: false, error: 'Booking not found' }
    }

    // Check if payout is on hold
    if (booking.payout_hold) {
      return {
        success: true,
        payoutCreated: false,
        blockers: ['Booking payout is on hold'],
      }
    }

    // Check if job is completed (optional for ingredients - can pay after delivery)
    // But prefer to wait for full booking completion
    if (!booking.job_completed_at && bookingIngredient.fulfillment_status !== 'paid') {
      return {
        success: true,
        payoutCreated: false,
        blockers: ['Job must be completed before ingredient payout'],
      }
    }

    // Fetch farmer
    const { data: farmer, error: farmerError } = await supabaseAdmin
      .from('farmers')
      .select(`
        id,
        name,
        stripe_account_id,
        stripe_connect_status,
        payouts_enabled
      `)
      .eq('id', bookingIngredient.farmer_id)
      .single()

    if (farmerError || !farmer) {
      return {
        success: false,
        error: 'Farmer not found',
        blockers: ['Farmer not found'],
      }
    }

    // Check farmer eligibility
    const blockers: string[] = []

    if (!farmer.stripe_account_id) {
      blockers.push('Farmer has no Stripe Connect account')
    }

    if (farmer.stripe_connect_status !== 'connected') {
      blockers.push(`Farmer Stripe status: ${farmer.stripe_connect_status}`)
    }

    if (!farmer.payouts_enabled) {
      blockers.push('Farmer payouts are not enabled')
    }

    // Verify account status with Stripe
    if (farmer.stripe_account_id) {
      const accountStatus = await getAccountStatus(farmer.stripe_account_id)
      if (!accountStatus.success || !accountStatus.payoutsEnabled) {
        blockers.push('Stripe account does not have payouts enabled')
      }
    }

    if (blockers.length > 0) {
      // Update booking_ingredients with blockers
      await supabaseAdmin
        .from('booking_ingredients')
        .update({
          payout_status: 'on_hold',
        })
        .eq('id', bookingIngredientId)

      return {
        success: true,
        payoutCreated: false,
        blockers,
      }
    }

    // Use total_cents from booking_ingredients
    const payoutAmountCents = bookingIngredient.total_cents || 0

    if (payoutAmountCents <= 0) {
      return {
        success: false,
        error: 'Invalid payout amount',
        blockers: ['Payout amount is zero or negative'],
      }
    }

    // Create Stripe transfer
    const transferResult = await createChefPayout(
      farmer.stripe_account_id!,
      payoutAmountCents,
      `Ingredient payout for ${bookingIngredient.ingredient_id} - ${bookingIngredient.booking_id.slice(0, 8)}`
    )

    if (!transferResult.success || !transferResult.transferId) {
      // Mark payout as failed
      await supabaseAdmin
        .from('booking_ingredients')
        .update({
          payout_status: 'failed',
        })
        .eq('id', bookingIngredientId)

      return {
        success: false,
        error: transferResult.error || 'Failed to create Stripe transfer',
        blockers: [transferResult.error || 'Stripe transfer failed'],
      }
    }

    // Update booking_ingredients as paid
    const now = new Date().toISOString()
    await supabaseAdmin
      .from('booking_ingredients')
      .update({
        payout_status: 'paid',
        paid_at: now,
        transfer_id: transferResult.transferId,
        fulfillment_status: 'paid', // Mark as paid
      })
      .eq('id', bookingIngredientId)

    console.log(`✅ Phase 6B: Ingredient payout completed: ${payoutAmountCents / 100} to ${farmer.name} for booking ${bookingIngredient.booking_id}`)

    return {
      success: true,
      payoutCreated: true,
      transferId: transferResult.transferId,
    }
  } catch (error: any) {
    console.error('Error in tryPayoutForBookingIngredient:', error)
    return {
      success: false,
      error: error.message || 'Failed to process ingredient payout',
    }
  }
}

/**
 * Phase 6B: Attempt payouts for all ingredients in a booking
 */
export async function tryPayoutsForBookingIngredients(bookingId: string): Promise<{
  success: boolean
  ingredientPayouts: Array<{
    ingredientId: string
    farmerId: string
    success: boolean
    transferId?: string
    error?: string
  }>
}> {
  try {
    // Fetch all booking ingredients for this booking
    const { data: bookingIngredients, error } = await supabaseAdmin
      .from('booking_ingredients')
      .select('id, ingredient_id, farmer_id, payout_status, fulfillment_status')
      .eq('booking_id', bookingId)
      .in('payout_status', ['pending'])
      .in('fulfillment_status', ['delivered', 'paid'])

    if (error || !bookingIngredients || bookingIngredients.length === 0) {
      return {
        success: true,
        ingredientPayouts: [],
      }
    }

    const results = await Promise.all(
      bookingIngredients.map(async (bi) => {
        const result = await tryPayoutForBookingIngredient(bi.id)
        return {
          ingredientId: bi.ingredient_id,
          farmerId: bi.farmer_id,
          success: result.success && result.payoutCreated === true,
          transferId: result.transferId,
          error: result.error || (result.blockers ? result.blockers.join(', ') : undefined),
        }
      })
    )

    return {
      success: true,
      ingredientPayouts: results,
    }
  } catch (error: any) {
    console.error('Error in tryPayoutsForBookingIngredients:', error)
    return {
      success: false,
      ingredientPayouts: [],
    }
  }
}
