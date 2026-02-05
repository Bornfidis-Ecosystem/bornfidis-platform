export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { randomBytes } from 'crypto'

/**
 * Phase 4B: Generate or rotate customer portal token
 * POST /api/admin/bookings/[id]/portal-token
 * 
 * Body (optional):
 * - force: boolean (if true, revoke existing token and generate new one)
 * 
 * Returns:
 * - token: string (portal token)
 * - portal_url: string (full portal URL)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Require admin authentication
    await requireAuth()

    const bookingId = params.id
    if (!bookingId) {
      return NextResponse.json(
        { success: false, error: 'Booking ID is required' },
        { status: 400 }
      )
    }

    const body = await request.json().catch(() => ({}))
    const force = body.force === true

    // Fetch booking to check current token status
    const { data: booking, error: fetchError } = await supabaseAdmin
      .from('booking_inquiries')
      .select('id, customer_portal_token, customer_portal_token_revoked_at')
      .eq('id', bookingId)
      .single()

    if (fetchError || !booking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Check if token exists and is not revoked
    const hasActiveToken = 
      booking.customer_portal_token && 
      !booking.customer_portal_token_revoked_at

    // If token exists and not forcing, return existing token
    if (hasActiveToken && !force) {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
      return NextResponse.json({
        success: true,
        token: booking.customer_portal_token,
        portal_url: `${siteUrl}/portal/${booking.customer_portal_token}`,
        message: 'Existing token returned. Use force=true to rotate.',
      })
    }

    // Generate new token (32 bytes = 64 hex characters)
    const newToken = randomBytes(32).toString('hex')

    // Update booking with new token
    const now = new Date().toISOString()
    const updateData: any = {
      customer_portal_token: newToken,
      customer_portal_token_created_at: now,
      customer_portal_token_revoked_at: null,
    }

    // If forcing rotation, revoke old token first (already handled by setting new token)
    const { error: updateError } = await supabaseAdmin
      .from('booking_inquiries')
      .update(updateData)
      .eq('id', bookingId)

    if (updateError) {
      console.error('Error updating booking with portal token:', updateError)
      return NextResponse.json(
        { success: false, error: 'Failed to generate portal token' },
        { status: 500 }
      )
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    return NextResponse.json({
      success: true,
      token: newToken,
      portal_url: `${siteUrl}/portal/${newToken}`,
      message: force ? 'Token rotated successfully' : 'Token generated successfully',
    })
  } catch (error: any) {
    console.error('Error generating portal token:', error)
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to generate portal token' },
      { status: 500 }
    )
  }
}
