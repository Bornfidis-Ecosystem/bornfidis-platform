import { NextRequest, NextResponse } from 'next/server'
import { sendSubmissionConfirmationSMS } from '@/lib/sms-utils'

/**
 * Send SMS Confirmation API Route
 * POST /api/sms/send
 * 
 * Sends confirmation SMS after form submission
 * Formats Jamaica numbers (+1876) automatically
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phone, name, submissionType, submissionData } = body

    // Validate required fields
    if (!phone || !name || !submissionType) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: phone, name, submissionType' },
        { status: 400 }
      )
    }

    // Use the helper function (with optional submission data)
    const result = await sendSubmissionConfirmationSMS(
      phone,
      name,
      submissionType,
      submissionData
    )

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to send SMS confirmation' },
        { status: result.error?.includes('Invalid') ? 400 : 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'SMS confirmation sent',
      messageSid: result.messageSid,
    })
  } catch (error: any) {
    console.error('Error in SMS send API:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to send SMS' },
      { status: 500 }
    )
  }
}
