/**
 * Phase 5B: Payout Engine
 * Handles idempotent chef payouts via Stripe Connect Transfers
 * Phase 2AV: Margin guardrails — block or allow with override (audit logged).
 */

import { supabaseAdmin } from '@/lib/supabase'
import { db } from '@/lib/db'
import { createChefPayout, getAccountStatus } from './stripe-connect'
import { checkMargin, logMarginOverride } from '@/lib/margin-guardrails'

export type PayoutOverride = { userId: string; reason?: string }

/**
 * Phase 5B: Attempt payout for a booking
 * Idempotent - will not create duplicate payouts
 * Phase 2AV: If margin guardrail fails and block, adds to blockers unless override is provided (then logs and proceeds).
 */
export async function tryPayoutForBooking(
  bookingId: string,
  override?: PayoutOverride | null
): Promise<{
  success: boolean
  payoutCreated?: boolean
  payoutId?: string
  transferId?: string
  error?: string
  blockers?: string[]
}> {
  try {
    // Phase 5C: Fetch booking with chef assignment (check booking_chefs table)
    const { data: bookingChef, error: bookingChefError } = await supabaseAdmin
      .from('booking_chefs')
      .select(`
        id,
        chef_id,
        payout_percentage,
        payout_amount_cents,
        status,
        stripe_transfer_id
      `)
      .eq('booking_id', bookingId)
      .single()

    if (bookingChefError || !bookingChef) {
      return {
        success: true,
        payoutCreated: false,
        blockers: ['No chef assigned to booking'],
      }
    }

    // Fetch booking to check payment status and Phase 5D completion/hold
    const { data: booking, error: bookingError } = await supabaseAdmin
      .from('booking_inquiries')
      .select(`
        id,
        name,
        quote_total_cents,
        fully_paid_at,
        chef_payout_status,
        stripe_transfer_id,
        job_completed_at,
        payout_hold,
        payout_hold_reason
      `)
      .eq('id', bookingId)
      .single()

    if (bookingError || !booking) {
      return { success: false, error: 'Booking not found' }
    }

    // Phase 5C/5D: Check if already paid (check booking_chefs status and transfer_id)
    if (bookingChef.status === 'paid' || bookingChef.payout_status === 'paid' || bookingChef.transfer_id || booking.stripe_transfer_id) {
      return {
        success: true,
        payoutCreated: false,
        error: 'Payout already completed',
      }
    }

    // Phase 5D: Check if payout is on hold
    if (booking.payout_hold) {
      return {
        success: true,
        payoutCreated: false,
        blockers: [`Payout on hold: ${booking.payout_hold_reason || 'No reason provided'}`],
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

    // Check if payout already exists in ledger (idempotency check)
    const { data: existingPayout } = await supabaseAdmin
      .from('chef_payouts')
      .select('id, status, stripe_transfer_id')
      .eq('booking_id', bookingId)
      .single()

    if (existingPayout && existingPayout.status === 'paid') {
      // Update booking if ledger shows paid but booking doesn't
      if (!booking.stripe_transfer_id && existingPayout.stripe_transfer_id) {
        await supabaseAdmin
          .from('booking_inquiries')
          .update({
            chef_payout_status: 'paid',
            stripe_transfer_id: existingPayout.stripe_transfer_id,
            chef_payout_paid_at: new Date().toISOString(),
          })
          .eq('id', bookingId)
      }
      return {
        success: true,
        payoutCreated: false,
        payoutId: existingPayout.id,
        transferId: existingPayout.stripe_transfer_id || undefined,
        error: 'Payout already exists and is paid',
      }
    }

    // Phase 5C: Fetch chef using booking_chefs.chef_id
    const { data: chef, error: chefError } = await supabaseAdmin
      .from('chefs')
      .select(`
        id,
        name,
        stripe_connect_account_id,
        stripe_connect_status,
        payouts_enabled,
        payout_percentage
      `)
      .eq('id', bookingChef.chef_id)
      .single()

    if (chefError || !chef) {
      return {
        success: false,
        error: 'Chef not found',
        blockers: ['Chef not found'],
      }
    }

    // Check chef eligibility
    const blockers: string[] = []

    if (!chef.stripe_connect_account_id) {
      blockers.push('Chef has no Stripe Connect account')
    }

    if (chef.stripe_connect_status !== 'connected') {
      blockers.push(`Chef Stripe status: ${chef.stripe_connect_status}`)
    }

    if (!chef.payouts_enabled) {
      blockers.push('Chef payouts are not enabled')
    }

    // Verify account status with Stripe
    if (chef.stripe_connect_account_id) {
      const accountStatus = await getAccountStatus(chef.stripe_connect_account_id)
      if (!accountStatus.success || !accountStatus.payoutsEnabled) {
        blockers.push('Stripe account does not have payouts enabled')
      }
    }

    // Phase 2AV: Margin guardrails — check via Prisma booking data
    try {
      const prismaBooking = await db.bookingInquiry.findUnique({
        where: { id: bookingId },
        select: {
          quoteTotalCents: true,
          chefPayoutAmountCents: true,
          chefPayoutBaseCents: true,
          chefPayoutBonusCents: true,
          chefRateMultiplier: true,
          regionCode: true,
          surgeMultiplierSnapshot: true,
          quoteTaxCents: true,
          quoteServiceFeeCents: true,
          quoteSubtotalCents: true,
        },
      })
      if (
        prismaBooking?.quoteTotalCents != null &&
        prismaBooking.quoteTotalCents > 0 &&
        prismaBooking.chefPayoutAmountCents != null
      ) {
        const jobValueCents =
          (prismaBooking.quoteTotalCents ?? 0) -
          (prismaBooking.quoteTaxCents ?? 0) -
          (prismaBooking.quoteServiceFeeCents ?? 0)
        const marginResult = await checkMargin({
          quoteTotalCents: prismaBooking.quoteTotalCents,
          chefPayoutAmountCents: prismaBooking.chefPayoutAmountCents,
          chefPayoutBaseCents: prismaBooking.chefPayoutBaseCents ?? 0,
          chefPayoutBonusCents: prismaBooking.chefPayoutBonusCents ?? 0,
          chefRateMultiplier: prismaBooking.chefRateMultiplier ?? null,
          surgeMultiplier: prismaBooking.surgeMultiplierSnapshot ?? null,
          jobValueCents: jobValueCents > 0 ? jobValueCents : (prismaBooking.quoteSubtotalCents ?? 0),
          regionCode: prismaBooking.regionCode ?? null,
        })
        if (!marginResult.pass) {
          if (override?.userId) {
            await logMarginOverride(
              bookingId,
              override.userId,
              'override_block',
              override.reason ?? undefined
            )
          } else if (marginResult.blockOrWarn) {
            blockers.push(
              marginResult.message ?? marginResult.failReasons.join('; ') ?? 'Margin guardrail failed'
            )
          }
        }
      }
    } catch (e) {
      console.warn('Margin guardrail check failed (non-fatal):', e)
    }

    if (blockers.length > 0) {
      // Update booking with blockers
      await supabaseAdmin
        .from('booking_inquiries')
        .update({
          chef_payout_status: 'blocked',
          chef_payout_blockers: blockers,
        })
        .eq('id', bookingId)

      return {
        success: true,
        payoutCreated: false,
        blockers,
      }
    }

    // Phase 5C: Use payout amount from booking_chefs (already calculated)
    const payoutAmountCents = bookingChef.payout_amount_cents || 0

    if (payoutAmountCents <= 0) {
      return {
        success: false,
        error: 'Invalid payout amount',
        blockers: ['Payout amount is zero or negative'],
      }
    }

    // Phase 5C: Create payout ledger entry first (idempotency)
    let payoutRecord: any = null
    const { data: newPayoutRecord, error: payoutInsertError } = await supabaseAdmin
      .from('chef_payouts')
      .insert({
        booking_id: bookingId,
        chef_id: bookingChef.chef_id,
        amount_cents: payoutAmountCents,
        status: 'pending',
      })
      .select()
      .single()

    if (payoutInsertError) {
      // Check if it's a unique constraint violation (already exists)
      if (payoutInsertError.code === '23505') {
        // Payout already exists, fetch it
        const { data: existing } = await supabaseAdmin
          .from('chef_payouts')
          .select('*')
          .eq('booking_id', bookingId)
          .single()

        if (existing) {
          if (existing.status === 'paid') {
            // Phase 5C: Update booking_chefs if already paid
            await supabaseAdmin
              .from('booking_chefs')
              .update({
                status: 'paid',
                paid_at: existing.paid_at,
                stripe_transfer_id: existing.stripe_transfer_id,
              })
              .eq('id', bookingChef.id)

            return {
              success: true,
              payoutCreated: false,
              payoutId: existing.id,
              transferId: existing.stripe_transfer_id || undefined,
              error: 'Payout already exists and is paid',
            }
          }
          // Use existing pending payout
          payoutRecord = existing
        } else {
          return { success: false, error: 'Failed to create payout record' }
        }
      } else {
        return { success: false, error: 'Failed to create payout record' }
      }
    } else {
      payoutRecord = newPayoutRecord
    }

    if (!payoutRecord) {
      return { success: false, error: 'Failed to create payout record' }
    }

    // Create Stripe transfer
    const transferResult = await createChefPayout(
      chef.stripe_connect_account_id!,
      payoutAmountCents,
      `Payout for booking ${booking.name} (${bookingId.slice(0, 8)})`
    )

    if (!transferResult.success || !transferResult.transferId) {
      // Mark payout as failed
      await supabaseAdmin
        .from('chef_payouts')
        .update({
          status: 'failed',
          error_message: transferResult.error || 'Transfer creation failed',
        })
        .eq('id', payoutRecord.id)

      await supabaseAdmin
        .from('booking_inquiries')
        .update({
          chef_payout_status: 'blocked',
          chef_payout_blockers: [transferResult.error || 'Stripe transfer failed'],
        })
        .eq('id', bookingId)

      return {
        success: false,
        error: transferResult.error || 'Failed to create Stripe transfer',
        blockers: [transferResult.error || 'Stripe transfer failed'],
      }
    }

    // Phase 5C: Update payout record as paid
    const now = new Date().toISOString()
    await supabaseAdmin
      .from('chef_payouts')
      .update({
        status: 'paid',
        stripe_transfer_id: transferResult.transferId,
        paid_at: now,
      })
      .eq('id', payoutRecord.id)

    // Phase 5C/5D: Update booking_chefs
    await supabaseAdmin
      .from('booking_chefs')
      .update({
        status: 'paid',
        paid_at: now,
        payout_status: 'paid',
        transfer_id: transferResult.transferId,
        stripe_transfer_id: transferResult.transferId, // Keep for backward compatibility
      })
      .eq('id', bookingChef.id)

    // Phase 5D: Update booking_inquiries for backward compatibility
    await supabaseAdmin
      .from('booking_inquiries')
      .update({
        chef_payout_status: 'paid',
        chef_payout_amount_cents: payoutAmountCents,
        chef_payout_paid_at: now,
        stripe_transfer_id: transferResult.transferId,
        payout_released_at: now,
      })
      .eq('id', bookingId)

    console.log(`✅ Phase 5C: Payout completed: ${payoutAmountCents / 100} to chef ${chef.name} for booking ${bookingId}`)

    return {
      success: true,
      payoutCreated: true,
      payoutId: payoutRecord.id,
      transferId: transferResult.transferId,
    }
  } catch (error: any) {
    console.error('Error in tryPayoutForBooking:', error)
    return {
      success: false,
      error: error.message || 'Failed to process payout',
    }
  }
}
