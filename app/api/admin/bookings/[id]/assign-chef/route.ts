import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

/**
 * Phase 5A: Assign chef to booking
 * POST /api/admin/bookings/[id]/assign-chef
 * 
 * Creates booking assignment with payout calculation (70% to chef)
 */
export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = await requireAuth()
        const bookingId = params.id

        if (!bookingId) {
            return NextResponse.json(
                { success: false, error: 'Booking ID is required' },
                { status: 400 }
            )
        }

        const body = await request.json()
        const { chef_id, assignment_notes } = body

        if (!chef_id) {
            return NextResponse.json(
                { success: false, error: 'Chef ID is required' },
                { status: 400 }
            )
        }

        // Fetch booking
        const { data: booking, error: bookingError } = await supabaseAdmin
            .from('booking_inquiries')
            .select('id, quote_total_cents, status')
            .eq('id', bookingId)
            .single()

        if (bookingError || !booking) {
            return NextResponse.json(
                { success: false, error: 'Booking not found' },
                { status: 404 }
            )
        }

        if (!booking.quote_total_cents || booking.quote_total_cents <= 0) {
            return NextResponse.json(
                { success: false, error: 'Booking must have a quote total before assigning a chef' },
                { status: 400 }
            )
        }

        // Fetch chef (Phase 5B: Check Connect status)
        const { data: chef, error: chefError } = await supabaseAdmin
            .from('chefs')
            .select('id, name, status, payout_percentage, stripe_connect_status, payouts_enabled, stripe_connect_account_id')
            .eq('id', chef_id)
            .single()

        if (chefError || !chef) {
            return NextResponse.json(
                { success: false, error: 'Chef not found' },
                { status: 404 }
            )
        }

        // Phase 5B: Check chef eligibility
        if (chef.status !== 'active' && chef.status !== 'approved') {
            return NextResponse.json(
                { success: false, error: 'Chef must be active or approved to receive assignments' },
                { status: 400 }
            )
        }

        // Phase 5B: Check if booking already has assigned chef
        if (booking.assigned_chef_id) {
            return NextResponse.json(
                { success: false, error: 'Booking already has an assigned chef' },
                { status: 400 }
            )
        }

        // Calculate payout (70% default, but use chef's payout_percentage)
        const chefPayoutPercentage = chef.payout_percentage || 70
        const chefPayoutCents = Math.round(booking.quote_total_cents * (chefPayoutPercentage / 100))

        // Phase 5B: Update booking directly with assigned_chef_id
        const { error: updateError } = await supabaseAdmin
            .from('booking_inquiries')
            .update({
                assigned_chef_id: chef_id,
                chef_payout_amount_cents: chefPayoutCents,
                chef_payout_status: 'pending', // Will be updated when fully paid
            })
            .eq('id', bookingId)

        if (updateError) {
            console.error('Error assigning chef:', updateError)
            return NextResponse.json(
                { success: false, error: 'Failed to assign chef' },
                { status: 500 }
            )
        }

        // Also create booking_assignments record for backward compatibility
        const { data: assignment } = await supabaseAdmin
            .from('booking_assignments')
            .insert({
                booking_id: bookingId,
                chef_id: chef_id,
                assigned_by: user.id,
                booking_total_cents: booking.quote_total_cents,
                chef_payout_percentage: chefPayoutPercentage,
                chef_payout_cents: chefPayoutCents,
                platform_fee_cents: booking.quote_total_cents - chefPayoutCents,
                payout_status: 'pending',
                status: 'assigned',
                assignment_notes: assignment_notes || null,
            })
            .select()
            .single()

        return NextResponse.json({
            success: true,
            message: 'Chef assigned successfully',
            assignment: {
                chef_payout_cents: chefPayoutCents,
                platform_fee_cents: booking.quote_total_cents - chefPayoutCents,
                payout_percentage: chefPayoutPercentage,
            },
        })
    } catch (error: any) {
        console.error('Error assigning chef:', error)
        if (error.message === 'Unauthorized') {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            )
        }
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to assign chef' },
            { status: 500 }
        )
    }
}
