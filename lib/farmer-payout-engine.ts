/**
 * Phase 6A: Farmer Payout Engine
 * Handles idempotent farmer payouts via Stripe Connect Transfers
 */

import { supabaseAdmin } from '@/lib/supabase'
import { createChefPayout, getAccountStatus } from './stripe-connect'

/**
 * Phase 6A: Attempt payout for a booking farmer assignment
 * Idempotent - will not create duplicate payouts
 */
export async function tryPayoutForBookingFarmer(bookingFarmerId: string): Promise<{
  success: boolean
  payoutCreated?: boolean
  payoutId?: string
  transferId?: string
  error?: string
  blockers?: string[]
}> {
  try {
    // Fetch booking farmer assignment
    const { data: bookingFarmer, error: bookingFarmerError } = await supabaseAdmin
      .from('booking_farmers')
      .select(`
        id,
        booking_id,
        farmer_id,
        payout_amount_cents,
        payout_status,
        transfer_id,
        role
      `)
      .eq('id', bookingFarmerId)
      .single()

    if (bookingFarmerError || !bookingFarmer) {
      return {
        success: false,
        error: 'Booking farmer assignment not found',
      }
    }

    // Check if already paid
    if (bookingFarmer.payout_status === 'paid' || bookingFarmer.transfer_id) {
      return {
        success: true,
        payoutCreated: false,
        error: 'Payout already completed',
      }
    }

    // Check if on hold
    if (bookingFarmer.payout_status === 'on_hold') {
      return {
        success: true,
        payoutCreated: false,
        blockers: ['Payout is on hold'],
      }
    }

    // Fetch booking to check payment and completion status
    const { data: booking, error: bookingError } = await supabaseAdmin
      .from('booking_inquiries')
      .select(`
        id,
        name,
        quote_total_cents,
        fully_paid_at,
        job_completed_at,
        payout_hold
      `)
      .eq('id', bookingFarmer.booking_id)
      .single()

    if (bookingError || !booking) {
      return { success: false, error: 'Booking not found' }
    }

    // Phase 5D: Check if payout is on hold
    if (booking.payout_hold) {
      return {
        success: true,
        payoutCreated: false,
        blockers: ['Booking payout is on hold'],
      }
    }

    // Phase 5D: Check if job is completed
    if (!booking.job_completed_at) {
      return {
        success: true,
        payoutCreated: false,
        blockers: ['Job must be completed before payout can be processed'],
      }
    }

    // Check if fully paid
    if (!booking.fully_paid_at) {
      return {
        success: true,
        payoutCreated: false,
        blockers: ['Booking is not fully paid'],
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
      .eq('id', bookingFarmer.farmer_id)
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
      // Update booking_farmers with blockers
      await supabaseAdmin
        .from('booking_farmers')
        .update({
          payout_status: 'on_hold',
          payout_error: blockers.join('; '),
        })
        .eq('id', bookingFarmerId)

      return {
        success: true,
        payoutCreated: false,
        blockers,
      }
    }

    // Use payout amount from booking_farmers
    const payoutAmountCents = bookingFarmer.payout_amount_cents || 0

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
      `Payout for booking ${booking.name} (${bookingFarmer.role}) - ${bookingFarmer.booking_id.slice(0, 8)}`
    )

    if (!transferResult.success || !transferResult.transferId) {
      // Mark payout as failed
      await supabaseAdmin
        .from('booking_farmers')
        .update({
          payout_status: 'failed',
          payout_error: transferResult.error || 'Transfer creation failed',
        })
        .eq('id', bookingFarmerId)

      return {
        success: false,
        error: transferResult.error || 'Failed to create Stripe transfer',
        blockers: [transferResult.error || 'Stripe transfer failed'],
      }
    }

    // Update booking_farmers as paid
    const now = new Date().toISOString()
    await supabaseAdmin
      .from('booking_farmers')
      .update({
        payout_status: 'paid',
        paid_at: now,
        transfer_id: transferResult.transferId,
      })
      .eq('id', bookingFarmerId)

    console.log(`✅ Phase 6A: Farmer payout completed: ${payoutAmountCents / 100} to ${farmer.name} (${bookingFarmer.role}) for booking ${bookingFarmer.booking_id}`)

    return {
      success: true,
      payoutCreated: true,
      transferId: transferResult.transferId,
    }
  } catch (error: any) {
    console.error('Error in tryPayoutForBookingFarmer:', error)
    return {
      success: false,
      error: error.message || 'Failed to process farmer payout',
    }
  }
}

/**
 * Phase 6A: Attempt payouts for all farmers assigned to a booking
 */
export async function tryPayoutsForBooking(bookingId: string): Promise<{
  success: boolean
  farmerPayouts: Array<{
    farmerId: string
    role: string
    success: boolean
    transferId?: string
    error?: string
  }>
}> {
  try {
    // Fetch all booking farmers for this booking
    const { data: bookingFarmers, error } = await supabaseAdmin
      .from('booking_farmers')
      .select('id, farmer_id, role, payout_status')
      .eq('booking_id', bookingId)
      .in('payout_status', ['pending'])

    if (error || !bookingFarmers || bookingFarmers.length === 0) {
      return {
        success: true,
        farmerPayouts: [],
      }
    }

    const results = await Promise.all(
      bookingFarmers.map(async (bf) => {
        const result = await tryPayoutForBookingFarmer(bf.id)
        return {
          farmerId: bf.farmer_id,
          role: bf.role,
          success: result.success && result.payoutCreated === true,
          transferId: result.transferId,
          error: result.error || (result.blockers ? result.blockers.join(', ') : undefined),
        }
      })
    )

    return {
      success: true,
      farmerPayouts: results,
    }
  } catch (error: any) {
    console.error('Error in tryPayoutsForBooking:', error)
    return {
      success: false,
      farmerPayouts: [],
    }
  }
}
