import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { kingdomFundSchema } from '@/lib/validation'

/**
 * Phase 7C: Create kingdom fund
 * POST /api/admin/harvest/funds
 * 
 * Admin-only route - creates a new kingdom fund
 */
export async function POST(request: NextRequest) {
  try {
    await requireAuth()

    const body = await request.json()
    const validated = kingdomFundSchema.parse(body)

    const { data: fund, error } = await supabaseAdmin
      .from('kingdom_funds')
      .insert(validated)
      .select()
      .single()

    if (error) {
      console.error('Error creating kingdom fund:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to create kingdom fund' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Kingdom fund created successfully',
      fund,
    })
  } catch (error: any) {
    console.error('Error in create kingdom fund API:', error)
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: 'Invalid form data: ' + error.errors.map((e: any) => e.message).join(', ') },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create kingdom fund' },
      { status: 500 }
    )
  }
}
