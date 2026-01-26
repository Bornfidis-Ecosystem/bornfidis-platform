import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { IngredientMatch } from '@/types/ingredient'

/**
 * Phase 6B: Generate purchase orders from matches
 * POST /api/admin/bookings/[id]/ingredients/orders
 * 
 * Creates booking_ingredients records for each matched farmer
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth()
    const bookingId = params.id

    const body = await request.json()
    const { matches } = body

    if (!matches || !Array.isArray(matches) || matches.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Matches array is required' },
        { status: 400 }
      )
    }

    let ordersCreated = 0
    const errors: string[] = []

    for (const match of matches) {
      if (match.matched_farmers.length === 0) {
        errors.push(`No farmers found for ${match.ingredient_name}`)
        continue
      }

      // Use first matched farmer (best match)
      const selectedFarmer = match.matched_farmers[0]

      // Calculate total
      const totalCents = Math.round(match.quantity * selectedFarmer.price_cents)

      // Check if already exists
      const { data: existing } = await supabaseAdmin
        .from('booking_ingredients')
        .select('id')
        .eq('booking_id', bookingId)
        .eq('ingredient_id', match.ingredient_id)
        .eq('farmer_id', selectedFarmer.farmer_id)
        .single()

      if (existing) {
        errors.push(`${match.ingredient_name} already ordered from ${selectedFarmer.farmer_name}`)
        continue
      }

      // Create booking ingredient
      const { error: insertError } = await supabaseAdmin
        .from('booking_ingredients')
        .insert({
          booking_id: bookingId,
          ingredient_id: match.ingredient_id,
          farmer_id: selectedFarmer.farmer_id,
          quantity: match.quantity,
          unit: match.unit,
          price_cents: selectedFarmer.price_cents,
          total_cents: totalCents,
          fulfillment_status: 'pending',
          payout_status: 'pending',
        })

      if (insertError) {
        console.error('Error creating booking ingredient:', insertError)
        errors.push(`Failed to create order for ${match.ingredient_name}`)
      } else {
        ordersCreated++
      }
    }

    return NextResponse.json({
      success: true,
      orders_created: ordersCreated,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (error: any) {
    console.error('Error generating orders:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to generate orders' },
      { status: 500 }
    )
  }
}
