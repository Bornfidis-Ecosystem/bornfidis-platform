export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { harvestMetricSchema } from '@/lib/validation'

/**
 * Phase 7C: Create harvest metric
 * POST /api/admin/harvest/metrics
 * 
 * Admin-only route - creates a new harvest metric record
 */
export async function POST(request: NextRequest) {
  try {
    await requireAuth()

    const body = await request.json()
    const validated = harvestMetricSchema.parse(body)

    const { data: metric, error } = await supabaseAdmin
      .from('harvest_metrics')
      .insert(validated)
      .select()
      .single()

    if (error) {
      console.error('Error creating harvest metric:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to create harvest metric' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Harvest metric created successfully',
      metric,
    })
  } catch (error: any) {
    console.error('Error in create harvest metric API:', error)
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: 'Invalid form data: ' + error.errors.map((e: any) => e.message).join(', ') },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create harvest metric' },
      { status: 500 }
    )
  }
}
