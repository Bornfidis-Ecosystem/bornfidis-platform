import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { ingredientSchema } from '@/lib/validation'

/**
 * Phase 6B: Get all ingredients
 * GET /api/admin/ingredients
 */
export async function GET(request: NextRequest) {
  try {
    await requireAuth()

    const { data: ingredients, error } = await supabaseAdmin
      .from('ingredients')
      .select('*')
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching ingredients:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch ingredients' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      ingredients: ingredients || [],
    })
  } catch (error: any) {
    console.error('Error in getIngredients:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch ingredients' },
      { status: 500 }
    )
  }
}

/**
 * Phase 6B: Create ingredient
 * POST /api/admin/ingredients
 */
export async function POST(request: NextRequest) {
  try {
    await requireAuth()

    const body = await request.json()
    const validated = ingredientSchema.parse(body)

    const { data: ingredient, error } = await supabaseAdmin
      .from('ingredients')
      .insert(validated)
      .select()
      .single()

    if (error) {
      console.error('Error creating ingredient:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to create ingredient' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      ingredient,
    })
  } catch (error: any) {
    console.error('Error creating ingredient:', error)
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: 'Invalid ingredient data: ' + error.errors.map((e: any) => e.message).join(', ') },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create ingredient' },
      { status: 500 }
    )
  }
}
