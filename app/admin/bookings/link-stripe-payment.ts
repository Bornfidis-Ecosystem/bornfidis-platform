'use server'

import { revalidatePath } from 'next/cache'
import { requireAdminUser } from '@/lib/requireAdmin'
import { requireFounderAdmin } from '@/lib/admin-rbac'
import { db } from '@/lib/db'
import { addBookingActivity } from '@/app/admin/bookings/actions'

/**
 * Attach an existing Stripe PaymentIntent to a booking and mark deposit/balance paid.
 * Use for Dashboard Payment Links / unmatched webhook rows (e.g. Shania Hardy backlog).
 */
export async function linkStripePaymentToBooking(input: {
  bookingId: string
  paymentIntentId: string
  paymentType: 'deposit' | 'balance'
  webhookLogId?: string
  amountCents?: number
  note?: string
}): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdminUser()
    await requireFounderAdmin()

    const pi = input.paymentIntentId.trim()
    if (!pi.startsWith('pi_')) {
      return { success: false, error: 'Payment intent id must start with pi_' }
    }

    const booking = await db.bookingInquiry.findUnique({
      where: { id: input.bookingId },
      select: {
        id: true,
        paidAt: true,
        balancePaidAt: true,
        depositAmountCents: true,
        quoteTotalCents: true,
      },
    })
    if (!booking) return { success: false, error: 'Booking not found' }

    const now = new Date()

    if (input.paymentType === 'deposit') {
      await db.bookingInquiry.update({
        where: { id: booking.id },
        data: {
          paidAt: booking.paidAt ?? now,
          status: 'confirmed',
          stripePaymentIntentId: pi,
          stripePaymentStatus: 'deposit_paid',
          ...(input.amountCents != null && input.amountCents > 0
            ? { depositAmountCents: input.amountCents }
            : {}),
        },
      })
      await addBookingActivity(booking.id, {
        type: 'manual_deposit_paid',
        title: 'Deposit linked from Stripe',
        description:
          input.note?.trim() ||
          `Manually linked Stripe payment ${pi} (reconciliation).`,
      })
    } else {
      await db.bookingInquiry.update({
        where: { id: booking.id },
        data: {
          paidAt: booking.paidAt ?? now,
          balancePaidAt: booking.balancePaidAt ?? now,
          fullyPaidAt: now,
          balancePaymentIntentId: pi,
          stripePaymentStatus: 'paid_in_full',
        },
      })
      await addBookingActivity(booking.id, {
        type: 'manual_balance_paid',
        title: 'Balance linked from Stripe',
        description:
          input.note?.trim() ||
          `Manually linked Stripe payment ${pi} (reconciliation).`,
      })
    }

    if (input.webhookLogId) {
      await db.stripeWebhookLog.update({
        where: { id: input.webhookLogId },
        data: {
          matchedBookingId: booking.id,
          processingStatus: 'matched',
          paymentType: input.paymentType,
          errorMessage: null,
        },
      })
    } else {
      // Seed an audit row so the Payments tab shows the manual match
      await db.stripeWebhookLog.create({
        data: {
          eventType: 'manual.link',
          stripeObjectId: pi,
          paymentIntentId: pi,
          amountCents: input.amountCents ?? undefined,
          matchedBookingId: booking.id,
          processingStatus: 'matched',
          paymentType: input.paymentType,
          errorMessage: 'Linked manually from admin booking detail',
        },
      })
    }

    revalidatePath(`/admin/bookings/${booking.id}`)
    revalidatePath('/admin/payments')
    return { success: true }
  } catch (e: unknown) {
    return {
      success: false,
      error: e instanceof Error ? e.message : 'Failed to link Stripe payment',
    }
  }
}
