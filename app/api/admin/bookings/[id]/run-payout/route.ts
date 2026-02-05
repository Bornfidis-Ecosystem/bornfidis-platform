export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { getCurrentPrismaUser } from '@/lib/partner'
import { tryPayoutForBooking } from '@/lib/payout-engine'
import { lockPayoutFxForBooking } from '@/lib/currency'
import { db } from '@/lib/db'

/**
 * Phase 5B: Manually trigger payout for a booking
 * Phase 2AI: Lock FX rate on payout creation (Prisma).
 * Phase 2AV: Margin guardrails — body may include { "override": true, "reason": "..." } to allow payout and log override.
 * POST /api/admin/bookings/[id]/run-payout
 *
 * Idempotent - safe to call multiple times
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth()
    const bookingId = params.id

    if (!bookingId) {
      return NextResponse.json(
        { success: false, error: 'Booking ID is required' },
        { status: 400 }
      )
    }

    let override: { userId: string; reason?: string } | null = null
    try {
      const body = await request.json().catch(() => ({}))
      if (body?.override && typeof body.override === 'boolean' && body.override) {
        const prismaUser = await getCurrentPrismaUser()
        if (prismaUser?.id) {
          override = { userId: prismaUser.id, reason: body.reason ?? undefined }
        }
      }
    } catch (_) {
      // no body or invalid JSON
    }

    const result = await tryPayoutForBooking(bookingId, override)

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to process payout' },
        { status: 500 }
      )
    }

    if (result.blockers && result.blockers.length > 0) {
      return NextResponse.json({
        success: true,
        payoutCreated: false,
        blockers: result.blockers,
        message: 'Payout cannot be processed due to blockers',
      })
    }

    if (result.payoutCreated) {
      const booking = await db.bookingInquiry.findUnique({
        where: { id: bookingId },
        select: { assignedChefId: true, chefPayoutAmountCents: true },
      })
      if (booking?.assignedChefId != null && booking.chefPayoutAmountCents != null) {
        await lockPayoutFxForBooking(
          bookingId,
          booking.assignedChefId,
          booking.chefPayoutAmountCents
        )
      }
      return NextResponse.json({
        success: true,
        payoutCreated: true,
        payoutId: result.payoutId,
        transferId: result.transferId,
        message: 'Payout processed successfully',
      })
    }

    return NextResponse.json({
      success: true,
      payoutCreated: false,
      message: result.error || 'Payout already exists or not eligible',
      payoutId: result.payoutId,
      transferId: result.transferId,
    })
  } catch (error: any) {
    console.error('Error running payout:', error)
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to run payout' },
      { status: 500 }
    )
  }
}
