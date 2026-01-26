import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { tryPayoutForBooking } from '@/lib/payout-engine'

/**
 * Phase 5B: Manually trigger payout for a booking
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

    const result = await tryPayoutForBooking(bookingId)

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
