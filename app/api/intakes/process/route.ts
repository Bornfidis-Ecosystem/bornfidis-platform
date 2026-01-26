/**
 * Phase 11G.2A: Intake Processing API (Status-Aware)
 * 
 * Processes a farmer intake by:
 * 1. Parsing the message text
 * 2. Determining status based on required fields
 * 3. Updating the intake record with parsed data and status
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { parseIntakeText } from '@/lib/intake/parseIntake'
import { requireAuth } from '@/lib/auth'

/**
 * POST /api/intakes/process
 * 
 * Processes an intake record by parsing its message and updating status.
 * 
 * Request body:
 * {
 *   "intakeId": "uuid-string"
 * }
 * 
 * Response:
 * {
 *   "status": "parsed" | "needs_followup",
 *   "parsed": ParsedFarmerIntake
 * }
 */
export async function POST(req: NextRequest) {
  try {
    // Require admin authentication
    await requireAuth()

    const { intakeId } = await req.json()

    if (!intakeId || typeof intakeId !== 'string') {
      return NextResponse.json(
        { error: 'intakeId is required and must be a string' },
        { status: 400 }
      )
    }

    // Fetch the intake record
    const intake = await db.farmerIntake.findUnique({
      where: { id: intakeId },
    })

    if (!intake) {
      return NextResponse.json(
        { error: 'Intake not found' },
        { status: 404 }
      )
    }

    // Get message text (prefer transcript if available, otherwise messageText)
    const messageText = intake.transcript || intake.messageText || ''

    if (!messageText) {
      return NextResponse.json(
        { error: 'No message text or transcript available for parsing' },
        { status: 400 }
      )
    }

    // Parse the message
    const parsed = parseIntakeText(messageText)

    // Determine status based on required fields
    // Required to advance: phone, parish, crops.length > 0
    const hasPhone = !!parsed.phone
    const hasParish = !!parsed.parish
    const hasCrops = !!parsed.crops && parsed.crops.length > 0

    const isComplete = hasPhone && hasParish && hasCrops

    // Determine status
    // - parsed: if all required fields are present
    // - needs_followup: if parsing succeeded but missing required fields, or parsing failed
    const status = isComplete ? 'parsed' : 'needs_followup'

    // Update the intake record
    await db.farmerIntake.update({
      where: { id: intakeId },
      data: {
        parsedData: parsed,
        status: status,
      },
    })

    return NextResponse.json({
      status,
      parsed,
    })
  } catch (error: any) {
    // Handle authentication errors
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.error('Error processing intake:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to process intake' },
      { status: 500 }
    )
  }
}
