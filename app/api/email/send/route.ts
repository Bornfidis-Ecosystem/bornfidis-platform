import { NextRequest, NextResponse } from 'next/server'
import { sendSubmissionNotificationEmail } from '@/lib/email-utils'

/**
 * Send Admin Notification Email
 * POST /api/email/send
 * 
 * Sends email notification to admin on every submission
 * Non-blocking - errors are logged but don't throw
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { submissionType, submissionData } = body

    // Validate required fields
    if (!submissionType) {
      return NextResponse.json(
        { success: false, error: 'Missing required field: submissionType' },
        { status: 400 }
      )
    }

    // Use the helper function to send the email
    const result = await sendSubmissionNotificationEmail(submissionType, submissionData || {})

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to send email' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Email notification sent',
      emailId: result.emailId,
    })
  } catch (error: any) {
    // Log error but don't throw - this is non-blocking
    console.error('Error sending admin notification email:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to send email' },
      { status: 500 }
    )
  }
}
