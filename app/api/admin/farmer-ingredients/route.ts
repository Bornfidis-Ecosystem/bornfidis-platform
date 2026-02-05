export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { farmerIngredientSchema } from '@/lib/validation'

/**
 * Phase 6B: Create farmer ingredient
 * POST /api/admin/farmer-ingredients
 */
export async function POST(request: NextRequest) {
  try {
    await requireAuth()

    const body = await request.json()
    const validated = farmerIngredientSchema.parse(body)

    // Check if already exists
    const { data: existing } = await supabaseAdmin
      .from('farmer_ingredients')
      .select('id')
      .eq('farmer_id', validated.farmer_id)
      .eq('ingredient_id', validated.ingredient_id)
      .single()

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Farmer already has this ingredient assigned' },
        { status: 400 }
      )
    }

    const { data: farmerIngredient, error } = await supabaseAdmin
      .from('farmer_ingredients')
      .insert(validated)
      .select(`
        *,
        ingredient:ingredients(*)
      `)
      .single()

    if (error) {
      console.error('Error creating farmer ingredient:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to add ingredient to farmer' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      farmer_ingredient: farmerIngredient,
    })
  } catch (error: any) {
    console.error('Error creating farmer ingredient:', error)
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: 'Invalid data: ' + error.errors.map((e: any) => e.message).join(', ') },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to add ingredient' },
      { status: 500 }
    )
  }
}
