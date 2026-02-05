export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { retryFailedSMS } from '@/lib/sms-reliability'
import { requireAdmin } from '@/lib/requireAdmin'

/**
 * Admin Endpoint: Retry Failed SMS
 * GET /api/admin/retry-failed-sms - List failed SMS
 * POST /api/admin/retry-failed-sms - Retry a specific failed SMS
 * DELETE /api/admin/retry-failed-sms - Delete failed SMS record
 */

// GET - List all failed SMS
export async function GET(request: NextRequest) {
  try {
    // Check admin access
    const authError = await requireAdmin(request)
    if (authError) return authError
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50', 10)
    const offset = parseInt(searchParams.get('offset') || '0', 10)

    const [failedSMS, total] = await Promise.all([
      db.failedSMS.findMany({
        take: limit,
        skip: offset,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      db.failedSMS.count(),
    ])

    return NextResponse.json({
      success: true,
      data: failedSMS,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    })
  } catch (error: any) {
    console.error('Error fetching failed SMS:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch failed SMS' },
      { status: 500 }
    )
  }
}

// POST - Retry a failed SMS
export async function POST(request: NextRequest) {
  try {
    // Check admin access
    const authError = await requireAdmin(request)
    if (authError) return authError
    const body = await request.json()
    const { id } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Missing required field: id' },
        { status: 400 }
      )
    }

    // Retry the failed SMS
    const result = await retryFailedSMS(id)

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to retry SMS' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'SMS retry successful',
      messageSid: result.messageSid,
    })
  } catch (error: any) {
    console.error('Error retrying failed SMS:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to retry SMS' },
      { status: 500 }
    )
  }
}

// DELETE - Remove a failed SMS record (after manual resolution)
export async function DELETE(request: NextRequest) {
  try {
    // Check admin access
    const authError = await requireAdmin(request)
    if (authError) return authError
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameter: id' },
        { status: 400 }
      )
    }

    await db.failedSMS.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: 'Failed SMS record deleted',
    })
  } catch (error: any) {
    console.error('Error deleting failed SMS:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete failed SMS' },
      { status: 500 }
    )
  }
}
