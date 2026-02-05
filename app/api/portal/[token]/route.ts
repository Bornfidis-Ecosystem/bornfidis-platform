export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getEffectiveTier } from '@/lib/chef-tier'
import { canSubmitReview, hasReviewForBooking, getReviewStatsForChef } from '@/lib/reviews'

/**
 * Phase 4B: Get portal data by token
 * GET /api/portal/[token]
 * 
 * Returns safe booking data for customer portal
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const token = params.token

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token is required' },
        { status: 400 }
      )
    }

    // Fetch booking by token (only active, non-revoked tokens)
    const { data: booking, error: fetchError } = await supabaseAdmin
      .from('booking_inquiries')
      .select(`
        id,
        name,
        email,
        phone,
        event_date,
        event_time,
        location,
        guests,
        status,
        assigned_chef_id,
        quote_subtotal_cents,
        quote_tax_cents,
        quote_service_fee_cents,
        quote_total_cents,
        quote_notes,
        quote_line_items,
        deposit_percentage,
        deposit_amount_cents,
        balance_amount_cents,
        paid_at,
        balance_paid_at,
        fully_paid_at,
        customer_portal_token_revoked_at
      `)
      .eq('customer_portal_token', token)
      .is('customer_portal_token_revoked_at', null)
      .single()

    if (fetchError || !booking) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired link' },
        { status: 404 }
      )
    }

    // Phase 2R/2S/2U: Assigned chef + tier label + review stats
    let chef: { id: string; name: string; tierLabel?: string; reviewStats?: { averageRating: number; count: number } } | null = null
    const assignedChefId = booking.assigned_chef_id
    if (assignedChefId) {
      const { data: chefRow } = await supabaseAdmin
        .from('chefs')
        .select('id, name')
        .eq('id', assignedChefId)
        .single()
      if (chefRow) {
        let tierLabel: string | undefined
        try {
          const tier = await getEffectiveTier(chefRow.id)
          tierLabel = tier === 'PRO' ? 'Pro Chef' : tier === 'ELITE' ? 'Elite Chef' : undefined
        } catch {
          // ignore
        }
        const reviewStats = await getReviewStatsForChef(chefRow.id)
        chef = {
          id: chefRow.id,
          name: chefRow.name ?? 'Your chef',
          tierLabel,
          reviewStats: reviewStats.count > 0 ? reviewStats : undefined,
        }
      }
    }

    // Phase 2U: Can client leave a review? (completed booking, no review yet)
    const canReviewResult = await canSubmitReview(booking.id)
    const hasReview = await hasReviewForBooking(booking.id)

    // Return safe fields only (no admin_notes or internal fields)
    const portalData = {
      booking_id: booking.id,
      customer_name: booking.name,
      customer_email: booking.email,
      customer_phone: booking.phone,
      event_date: booking.event_date,
      event_time: booking.event_time,
      location: booking.location,
      guests: booking.guests,
      status: booking.status,
      quote: {
        subtotal_cents: booking.quote_subtotal_cents || 0,
        tax_cents: booking.quote_tax_cents || 0,
        service_fee_cents: booking.quote_service_fee_cents || 0,
        total_cents: booking.quote_total_cents || 0,
        notes: booking.quote_notes,
        line_items: (() => {
          const items = booking.quote_line_items
          if (!items) return []
          if (Array.isArray(items)) return items
          if (typeof items === 'string') {
            try {
              const parsed = JSON.parse(items)
              return Array.isArray(parsed) ? parsed : []
            } catch {
              return []
            }
          }
          return []
        })(),
      },
      deposit: {
        percentage: booking.deposit_percentage || 0,
        amount_cents: booking.deposit_amount_cents || 0,
        paid: !!booking.paid_at,
        paid_at: booking.paid_at,
      },
      balance: {
        amount_cents: booking.balance_amount_cents || 0,
        paid: !!booking.balance_paid_at,
        paid_at: booking.balance_paid_at,
      },
      fully_paid: !!booking.fully_paid_at,
      fully_paid_at: booking.fully_paid_at,
      invoice_available: !!booking.fully_paid_at,
      chef: chef,
      can_review: canReviewResult.allowed,
      has_review: hasReview,
    }

    return NextResponse.json({
      success: true,
      data: portalData,
    })
  } catch (error: any) {
    console.error('Error fetching portal data:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch portal data' },
      { status: 500 }
    )
  }
}
