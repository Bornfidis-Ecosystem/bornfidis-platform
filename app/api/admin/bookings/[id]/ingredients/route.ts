import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

/**
 * Phase 6B: Get booking ingredients
 * GET /api/admin/bookings/[id]/ingredients
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth()
    const bookingId = params.id

    const { data: bookingIngredients, error } = await supabaseAdmin
      .from('booking_ingredients')
      .select(`
        *,
        ingredient:ingredients(*),
        farmer:farmers(id, name, email)
      `)
      .eq('booking_id', bookingId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching booking ingredients:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch ingredients' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      booking_ingredients: bookingIngredients || [],
    })
  } catch (error: any) {
    console.error('Error fetching booking ingredients:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch ingredients' },
      { status: 500 }
    )
  }
}
