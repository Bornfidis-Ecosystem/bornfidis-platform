export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { readCropStatus, updateCropStatus } from '@/lib/proju-crop-status'
import type { ProJuCropStatus } from '@/types/proju-crop-status'

/**
 * Phase 2M-F: ProJu Crop Status API
 * 
 * GET /api/admin/proju/crop-status - Read all crop statuses
 * POST /api/admin/proju/crop-status - Update a crop status
 * 
 * Admin-only. No automation. Read-only visibility for decision clarity.
 */

export async function GET(request: NextRequest) {
  try {
    await requireAuth()

    const statusData = readCropStatus()

    return NextResponse.json({
      success: true,
      crop_status: statusData,
    })
  } catch (error: any) {
    console.error('Error reading crop status:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to read crop status',
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAuth()

    const body = await request.json()
    const { ingredientName, status, note, lastValidated } = body

    if (!ingredientName || !status || !note) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: ingredientName, status, note',
        },
        { status: 400 }
      )
    }

    // Validate status
    const validStatuses: ProJuCropStatus[] = [
      'draft',
      'validated',
      'limited',
      'paused',
      'retired',
    ]
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
        },
        { status: 400 }
      )
    }

    updateCropStatus(ingredientName, status, note, lastValidated)

    return NextResponse.json({
      success: true,
      message: 'Crop status updated',
    })
  } catch (error: any) {
    console.error('Error updating crop status:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to update crop status',
      },
      { status: 500 }
    )
  }
}
