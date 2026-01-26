/**
 * Phase 6C: Impact Tracker
 * Automatically records impact events when bookings complete
 */

import { supabaseAdmin } from '@/lib/supabase'
import { formatUSD } from '@/lib/money'

/**
 * Phase 6C: Record impact event
 */
export async function recordImpactEvent(event: {
  type: 'soil' | 'farmer' | 'chef' | 'guest' | 'community'
  reference_id?: string
  booking_id?: string
  metric: string
  value: number
  unit: string
  description?: string
  metadata?: Record<string, any>
}): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabaseAdmin
      .from('impact_events')
      .insert(event)

    if (error) {
      console.error('Error recording impact event:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error: any) {
    console.error('Error in recordImpactEvent:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Phase 6C: Record impact when booking completes
 * Called after booking is fully paid and job is completed
 */
export async function recordBookingImpact(bookingId: string): Promise<{
  success: boolean
  events_recorded: number
  error?: string
}> {
  try {
    let eventsRecorded = 0

    // Fetch booking with related data
    const { data: booking, error: bookingError } = await supabaseAdmin
      .from('booking_inquiries')
      .select(`
        id,
        name,
        quote_total_cents,
        guests,
        fully_paid_at,
        job_completed_at
      `)
      .eq('id', bookingId)
      .single()

    if (bookingError || !booking) {
      return { success: false, events_recorded: 0, error: 'Booking not found' }
    }

    // 1. Soil Impact - from ingredients used
    const { data: bookingIngredients } = await supabaseAdmin
      .from('booking_ingredients')
      .select(`
        id,
        ingredient_id,
        quantity,
        ingredient:ingredients(regenerative_score, name)
      `)
      .eq('booking_id', bookingId)

    if (bookingIngredients && bookingIngredients.length > 0) {
      const totalSoilPoints = bookingIngredients.reduce((sum, bi) => {
        const score = (bi.ingredient as any)?.regenerative_score || 0
        return sum + (score * (bi.quantity || 0))
      }, 0)

      if (totalSoilPoints > 0) {
        await recordImpactEvent({
          type: 'soil',
          booking_id: bookingId,
          metric: 'soil_health_points',
          value: totalSoilPoints,
          unit: 'points',
          description: `Soil health impact from ${bookingIngredients.length} regenerative ingredient${bookingIngredients.length !== 1 ? 's' : ''}`,
          metadata: {
            ingredient_count: bookingIngredients.length,
            ingredients: bookingIngredients.map(bi => ({
              name: (bi.ingredient as any)?.name,
              score: (bi.ingredient as any)?.regenerative_score,
              quantity: bi.quantity,
            })),
          },
        })
        eventsRecorded++
      }
    }

    // 2. Farmer Income Impact - from role assignments
    const { data: bookingFarmers } = await supabaseAdmin
      .from('booking_farmers')
      .select(`
        id,
        farmer_id,
        payout_amount_cents,
        role,
        farmer:farmers(name)
      `)
      .eq('booking_id', bookingId)
      .eq('payout_status', 'paid')

    if (bookingFarmers && bookingFarmers.length > 0) {
      const totalFarmerIncome = bookingFarmers.reduce((sum, bf) => sum + (bf.payout_amount_cents || 0), 0)

      if (totalFarmerIncome > 0) {
        await recordImpactEvent({
          type: 'farmer',
          booking_id: bookingId,
          metric: 'income_cents',
          value: totalFarmerIncome,
          unit: 'cents',
          description: `Farmer income generated: ${formatUSD(totalFarmerIncome)}`,
          metadata: {
            farmer_count: bookingFarmers.length,
            farmers: bookingFarmers.map(bf => ({
              name: (bf.farmer as any)?.name,
              role: bf.role,
              amount_cents: bf.payout_amount_cents,
            })),
          },
        })
        eventsRecorded++
      }
    }

    // 3. Farmer Income Impact - from ingredient orders
    const { data: ingredientOrders } = await supabaseAdmin
      .from('booking_ingredients')
      .select(`
        id,
        farmer_id,
        total_cents,
        ingredient:ingredients(name),
        farmer:farmers(name)
      `)
      .eq('booking_id', bookingId)
      .eq('payout_status', 'paid')

    if (ingredientOrders && ingredientOrders.length > 0) {
      const totalIngredientIncome = ingredientOrders.reduce((sum, io) => sum + (io.total_cents || 0), 0)

      if (totalIngredientIncome > 0) {
        await recordImpactEvent({
          type: 'farmer',
          booking_id: bookingId,
          metric: 'income_cents',
          value: totalIngredientIncome,
          unit: 'cents',
          description: `Farmer income from ingredient sourcing: ${formatUSD(totalIngredientIncome)}`,
          metadata: {
            ingredient_order_count: ingredientOrders.length,
            orders: ingredientOrders.map(io => ({
              ingredient: (io.ingredient as any)?.name,
              farmer: (io.farmer as any)?.name,
              amount_cents: io.total_cents,
            })),
          },
        })
        eventsRecorded++
      }
    }

    // 4. Chef Income Impact
    const { data: bookingChef } = await supabaseAdmin
      .from('booking_chefs')
      .select(`
        id,
        chef_id,
        payout_amount_cents,
        chef:chefs(name)
      `)
      .eq('booking_id', bookingId)
      .eq('payout_status', 'paid')
      .single()

    if (bookingChef && bookingChef.payout_amount_cents > 0) {
      await recordImpactEvent({
        type: 'chef',
        reference_id: bookingChef.chef_id,
        booking_id: bookingId,
        metric: 'income_cents',
        value: bookingChef.payout_amount_cents,
        unit: 'cents',
        description: `Chef income: ${formatUSD(bookingChef.payout_amount_cents)}`,
        metadata: {
          chef_name: (bookingChef.chef as any)?.name,
        },
      })
      eventsRecorded++
    }

    // 5. Meals Served
    const guests = booking.guests || 0
    if (guests > 0) {
      await recordImpactEvent({
        type: 'guest',
        booking_id: bookingId,
        metric: 'meals_served',
        value: guests,
        unit: 'meals',
        description: `${guests} meal${guests !== 1 ? 's' : ''} served at ${booking.name}`,
        metadata: {
          event_name: booking.name,
        },
      })
      eventsRecorded++
    }

    // 6. Community Impact - estimate families supported
    // 1 family per 4 guests (estimate)
    const familiesSupported = Math.ceil(guests / 4)
    if (familiesSupported > 0) {
      await recordImpactEvent({
        type: 'community',
        booking_id: bookingId,
        metric: 'families_supported',
        value: familiesSupported,
        unit: 'families',
        description: `Supported ${familiesSupported} famil${familiesSupported !== 1 ? 'ies' : 'y'} through ${booking.name}`,
        metadata: {
          event_name: booking.name,
          guests: guests,
        },
      })
      eventsRecorded++
    }

    // 7. Ingredients Sourced
    if (bookingIngredients && bookingIngredients.length > 0) {
      await recordImpactEvent({
        type: 'soil',
        booking_id: bookingId,
        metric: 'ingredients_sourced',
        value: bookingIngredients.length,
        unit: 'ingredients',
        description: `Sourced ${bookingIngredients.length} local ingredient${bookingIngredients.length !== 1 ? 's' : ''}`,
        metadata: {
          ingredient_count: bookingIngredients.length,
        },
      })
      eventsRecorded++
    }

    console.log(`✅ Phase 6C: Recorded ${eventsRecorded} impact events for booking ${bookingId}`)

    return {
      success: true,
      events_recorded: eventsRecorded,
    }
  } catch (error: any) {
    console.error('Error in recordBookingImpact:', error)
    return {
      success: false,
      events_recorded: 0,
      error: error.message || 'Failed to record booking impact',
    }
  }
}

