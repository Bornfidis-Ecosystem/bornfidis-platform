import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { impactTransactionSchema } from '@/lib/validation'

/**
 * Phase 7C: Create impact transaction
 * POST /api/admin/harvest/transactions
 * 
 * Admin-only route - creates a new impact transaction
 * Note: Fund balance is automatically updated via database trigger
 */
export async function POST(request: NextRequest) {
  try {
    await requireAuth()

    const body = await request.json()
    const validated = impactTransactionSchema.parse(body)

    const { data: transaction, error } = await supabaseAdmin
      .from('impact_transactions')
      .insert(validated)
      .select()
      .single()

    if (error) {
      console.error('Error creating impact transaction:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to create impact transaction' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Impact transaction created successfully',
      transaction,
    })
  } catch (error: any) {
    console.error('Error in create impact transaction API:', error)
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: 'Invalid form data: ' + error.errors.map((e: any) => e.message).join(', ') },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create impact transaction' },
      { status: 500 }
    )
  }
}
