import { Resend } from 'resend'

// Initialize Resend client
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

// Email "from" address
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL
  ? `Bornfidis Provisions <${process.env.RESEND_FROM_EMAIL}>`
  : 'Bornfidis Provisions <onboarding@resend.dev>'

/**
 * Helper function to send submission notification email
 * Can be called directly from server-side code
 * 
 * @param submissionType - Type of submission (e.g., 'farmer', 'booking', etc.)
 * @param submissionData - Data object containing submission details
 * @returns Promise with success status and optional error/emailId
 */
export async function sendSubmissionNotificationEmail(
  submissionType: string,
  submissionData: Record<string, any>
): Promise<{ success: boolean; error?: string; emailId?: string }> {
  try {
    const adminEmail = process.env.ADMIN_EMAIL
    if (!adminEmail) {
      console.warn('⚠️ ADMIN_EMAIL not set. Skipping email notification.')
      return { success: false, error: 'ADMIN_EMAIL not configured' }
    }

    if (!resend) {
      console.warn('⚠️ Resend not configured. Skipping email notification.')
      return { success: false, error: 'Resend not configured' }
    }

    // Format timestamp
    const timestamp = new Date().toLocaleString('en-US', {
      timeZone: 'America/Jamaica',
      dateStyle: 'full',
      timeStyle: 'long',
    })

    // Format submission data as HTML table
    const formatSubmissionData = (data: any): string => {
      if (!data || typeof data !== 'object') {
        return '<p>No submission data provided.</p>'
      }

      let html = '<table style="width: 100%; border-collapse: collapse; margin: 20px 0;">'
      
      for (const [key, value] of Object.entries(data)) {
        if (value === null || value === undefined) {
          continue
        }

        // Format key (convert camelCase to Title Case)
        const formattedKey = key
          .replace(/([A-Z])/g, ' $1')
          .replace(/^./, str => str.toUpperCase())
          .trim()

        // Format value
        let formattedValue = String(value)
        if (Array.isArray(value)) {
          formattedValue = value.join(', ')
        } else if (typeof value === 'object') {
          formattedValue = JSON.stringify(value, null, 2)
        }

        html += `
          <tr style="border-bottom: 1px solid #e5e5e5;">
            <td style="padding: 12px; font-weight: 600; color: #002747; width: 200px; vertical-align: top;">${formattedKey}:</td>
            <td style="padding: 12px; color: #333; word-break: break-word;">${formattedValue}</td>
          </tr>
        `
      }
      
      html += '</table>'
      return html
    }

    // Build email HTML
    const emailHtml = `
      <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 700px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
        <div style="background-color: #1a5f3f; color: white; padding: 24px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">New ${submissionType} Submission</h1>
        </div>
        
        <div style="background-color: #f9f9f9; padding: 24px; border: 1px solid #e5e5e5; border-top: none; border-radius: 0 0 8px 8px;">
          <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 12px; margin-bottom: 24px; border-radius: 4px;">
            <p style="margin: 0; color: #856404; font-weight: 600;">
              📅 Received: ${timestamp}
            </p>
          </div>
          
          <h2 style="color: #002747; margin-top: 0; border-bottom: 2px solid #1a5f3f; padding-bottom: 8px;">
            Submission Details
          </h2>
          
          ${formatSubmissionData(submissionData)}
          
          <div style="margin-top: 32px; padding-top: 24px; border-top: 2px solid #e5e5e5;">
            <p style="color: #666; font-size: 14px; margin: 0;">
              This is an automated notification from the Bornfidis platform.
            </p>
          </div>
        </div>
      </div>
    `

    // Send email
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: adminEmail,
      subject: `[Bornfidis] New ${submissionType} Submission`,
      html: emailHtml,
    })

    console.log(`✅ Admin notification email sent for ${submissionType} submission`)

    return {
      success: true,
      emailId: result.id,
    }
  } catch (error: any) {
    console.error('Error sending submission notification email:', error)
    return {
      success: false,
      error: error.message || 'Failed to send email',
    }
  }
}
