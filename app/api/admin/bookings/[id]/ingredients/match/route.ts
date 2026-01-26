import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { IngredientMatch } from '@/types/ingredient'

/**
 * Phase 6B: Auto-match farmers for ingredients
 * POST /api/admin/bookings/[id]/ingredients/match
 * 
 * Matches ingredients to farmers based on:
 * - Availability (in_stock preferred)
 * - Regenerative score (higher is better)
 * - Certified status (preferred)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth()
    const bookingId = params.id

    const body = await request.json()
    const { ingredients } = body

    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Ingredients array is required' },
        { status: 400 }
      )
    }

    const matches: IngredientMatch[] = []

    for (const item of ingredients) {
      if (!item.ingredient_id) continue

      // Fetch ingredient details
      const { data: ingredient } = await supabaseAdmin
        .from('ingredients')
        .select('*')
        .eq('id', item.ingredient_id)
        .single()

      if (!ingredient) continue

      // Find farmers who supply this ingredient
      const { data: farmerIngredients } = await supabaseAdmin
        .from('farmer_ingredients')
        .select(`
          *,
          farmer:farmers(id, name, location, status, stripe_connect_status)
        `)
        .eq('ingredient_id', item.ingredient_id)
        .eq('availability', 'in_stock')
        .order('certified', { ascending: false }) // Prefer certified
        .order('price_cents', { ascending: true }) // Then by price

      if (!farmerIngredients || farmerIngredients.length === 0) {
        // Try limited availability as fallback
        const { data: limitedFarmers } = await supabaseAdmin
          .from('farmer_ingredients')
          .select(`
            *,
            farmer:farmers(id, name, location, status, stripe_connect_status)
          `)
          .eq('ingredient_id', item.ingredient_id)
          .eq('availability', 'limited')
          .order('certified', { ascending: false })
          .order('price_cents', { ascending: true })

        if (limitedFarmers && limitedFarmers.length > 0) {
          const matchedFarmers = limitedFarmers
            .filter(fi => fi.farmer && (fi.farmer as any).status === 'approved')
            .slice(0, 3) // Top 3 matches
            .map(fi => ({
              farmer_id: fi.farmer_id,
              farmer_name: (fi.farmer as any).name,
              price_cents: fi.price_cents,
              availability: fi.availability,
              regenerative_score: ingredient.regenerative_score,
              certified: fi.certified,
            }))

          matches.push({
            ingredient_id: item.ingredient_id,
            ingredient_name: ingredient.name,
            category: ingredient.category as any,
            quantity: item.quantity,
            unit: item.unit,
            matched_farmers: matchedFarmers,
          })
        } else {
          // No matches found
          matches.push({
            ingredient_id: item.ingredient_id,
            ingredient_name: ingredient.name,
            category: ingredient.category as any,
            quantity: item.quantity,
            unit: item.unit,
            matched_farmers: [],
          })
        }
      } else {
        // Found in-stock farmers
        const matchedFarmers = farmerIngredients
          .filter(fi => fi.farmer && (fi.farmer as any).status === 'approved')
          .slice(0, 3) // Top 3 matches
          .map(fi => ({
            farmer_id: fi.farmer_id,
            farmer_name: (fi.farmer as any).name,
            price_cents: fi.price_cents,
            availability: fi.availability,
            regenerative_score: ingredient.regenerative_score,
            certified: fi.certified,
          }))

        matches.push({
          ingredient_id: item.ingredient_id,
          ingredient_name: ingredient.name,
          category: ingredient.category as any,
          quantity: item.quantity,
          unit: item.unit,
          matched_farmers: matchedFarmers,
        })
      }
    }

    return NextResponse.json({
      success: true,
      matches,
    })
  } catch (error: any) {
    console.error('Error matching ingredients:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to match ingredients' },
      { status: 500 }
    )
  }
}
