import { sendSMSWithRetry } from '@/lib/sms-reliability'
import { sendSubmissionNotificationEmail } from '@/lib/email-utils'

/**
 * Send SMS Confirmation Helper
 * Can be called directly from server-side code (preferred)
 * or via API route for external calls
 * 
 * Now includes:
 * - Retry logic (max 3 attempts with exponential backoff)
 * - Rate limiting (max 5 SMS per phone per hour)
 * - Failure tracking in FailedSMS table
 * - Email notification to admin after successful SMS
 * - Non-blocking (never blocks form submissions)
 * 
 * @param phone - Phone number to send SMS to
 * @param name - Name of the person submitting
 * @param submissionType - Type of submission (e.g., 'farmer', 'booking', etc.)
 * @param submissionData - Optional submission data to include in admin email
 * @returns Promise with success status and optional error/messageSid
 */
export async function sendSubmissionConfirmationSMS(
  phone: string,
  name: string,
  submissionType: string,
  submissionData?: Record<string, any>
): Promise<{ success: boolean; error?: string; messageSid?: string }> {
  // Format confirmation message
  const message = `Hi ${name}, we've received your ${submissionType} submission. A Bornfidis coordinator will reach out within 48 hours. Blessings, Bornfidis 🌱`

  // Send SMS with retry logic and rate limiting
  // This is non-blocking and will never throw errors
  const result = await sendSMSWithRetry({
    phone: phone,
    message: message,
    submissionType: submissionType,
  })

  // Log result (safe logging - no secrets)
  if (result.success) {
    console.log(`✅ SMS sent to ${phone.substring(0, 7)}... for ${submissionType} submission`)
    
    // Send email notification to admin (non-blocking)
    if (submissionData) {
      sendSubmissionNotificationEmail(submissionType, {
        name,
        phone,
        ...submissionData,
      }).catch((emailError) => {
        // Log but don't throw - email failure shouldn't affect SMS success
        console.error('Error sending admin notification email (non-blocking):', emailError)
      })
    } else {
      // Send basic notification if no submission data provided
      sendSubmissionNotificationEmail(submissionType, {
        name,
        phone,
        submissionType,
      }).catch((emailError) => {
        console.error('Error sending admin notification email (non-blocking):', emailError)
      })
    }
  } else {
    // Error is logged by sendSMSWithRetry, but we log here for context
    console.warn(`⚠️ SMS failed for ${submissionType} submission: ${result.error}`)
  }

  return {
    success: result.success,
    error: result.error,
    messageSid: result.messageSid,
  }
}
