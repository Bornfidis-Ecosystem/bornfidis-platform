import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/requireAdmin'
import { db } from '@/lib/db'
import { supabaseAdmin } from '@/lib/supabase'
import { getRecommendedChefs } from '@/lib/booking-chef-optimizer'

export const dynamic = 'force-dynamic'

/**
 * Phase 2AD — Scheduling optimizer: top 3 recommended chefs for this booking.
 * GET /api/admin/bookings/[id]/recommended-chefs
 * Uses: event date & time, availability + conflict check, tier + performance + workload score.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authError = await requireAdmin(request)
    if (authError) return authError

    const { id: bookingId } = await params
    const booking = await db.bookingInquiry.findUnique({
      where: { id: bookingId },
      select: { eventDate: true, eventTime: true },
    })
    if (!booking) {
      return NextResponse.json({ success: false, error: 'Booking not found' }, { status: 404 })
    }

    const { data: chefs, error } = await supabaseAdmin
      .from('chefs')
      .select('id, name')
      .in('status', ['active', 'approved'])
      .order('name', { ascending: true })

    if (error || !chefs?.length) {
      const result = await getRecommendedChefs(
        booking.eventDate,
        booking.eventTime,
        []
      )
      return NextResponse.json({
        success: true,
        recommendations: result.recommendations,
        warning: result.warning,
      })
    }

    const candidates = chefs.map((c: { id: string; name: string }) => ({
      id: c.id,
      name: c.name ?? 'Chef',
    }))
    const result = await getRecommendedChefs(
      booking.eventDate,
      booking.eventTime,
      candidates
    )
    return NextResponse.json({
      success: true,
      recommendations: result.recommendations,
      warning: result.warning,
    })
  } catch (e) {
    console.error('Recommended chefs API:', e)
    return NextResponse.json(
      { success: false, error: e instanceof Error ? e.message : 'Failed' },
      { status: 500 }
    )
  }
}
