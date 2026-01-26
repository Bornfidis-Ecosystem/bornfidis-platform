import { Resend } from 'resend'

// Check if Resend API key is configured
if (!process.env.RESEND_API_KEY) {
  console.warn('⚠️  RESEND_API_KEY is not set. Emails will not be sent.')
}

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

// Email "from" address - use custom domain if verified, otherwise use Resend test domain
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL
  ? `Bornfidis Provisions <${process.env.RESEND_FROM_EMAIL}>`
  : 'Bornfidis Provisions <onboarding@resend.dev>'

/**
 * Phase 1: Client booking confirmation email
 * Simple, clean template for booking submissions
 */
export async function sendBookingConfirmationEmail(
  to: string,
  name: string,
  bookingData: {
    eventDate: string
    eventLocation: string
    guestCount?: number
    dietaryRestrictions?: string
  }
) {
  if (!resend) {
    console.warn('⚠️ RESEND_API_KEY not set — email skipped')
    return { success: false, error: 'Email service not configured' }
  }

  if (!to || !to.includes('@')) {
    console.error('Invalid email address:', to)
    return { success: false, error: 'Invalid email address' }
  }

  try {
    // Format event date for display
    const eventDateFormatted = new Date(bookingData.eventDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })

    console.log('📧 Sending confirmation email to:', to)
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: 'We received your Bornfidis booking request',
      html: `
        <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; line-height: 1.6;">
          <h2 style="color: #1a5f3f; margin-bottom: 16px;">Thank you for your inquiry, ${name}</h2>
          
          <p>We've received your booking request for <strong>${eventDateFormatted}</strong>.</p>
          
          <p>Our team will review and contact you shortly.</p>

          <p style="margin-top: 24px;">
            With gratitude,<br/>
            <strong>Bornfidis Provisions</strong><br/>
            Regenerative Food • Community • Trust
          </p>
        </div>
      `,
    })
    console.log('✅ Confirmation email sent successfully')
    return { success: true, data: result }
  } catch (error: any) {
    console.error('❌ Error sending confirmation email:', error)
    return { success: false, error: error.message || 'Failed to send email' }
  }
}

/**
 * Phase 1: Admin booking notification email
 * Simple notification to tech@bornfidis.com when booking is submitted
 */
export async function sendAdminNotificationEmail(
  adminEmail: string,
  bookingData: {
    name: string
    email?: string
    phone?: string
    eventDate: string
    eventTime?: string
    eventLocation: string
    guestCount?: number
    budgetRange?: string
    dietaryRestrictions?: string
    notes?: string
  }
) {
  if (!resend) {
    console.warn('⚠️ RESEND_API_KEY not set — email skipped')
    return { success: false, error: 'Email service not configured' }
  }

  if (!adminEmail || !adminEmail.includes('@')) {
    console.error('Invalid admin email address:', adminEmail)
    return { success: false, error: 'Invalid admin email address' }
  }

  try {
    // Format event date for display
    const eventDateFormatted = new Date(bookingData.eventDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })

    console.log('📧 Sending admin notification email to:', adminEmail)
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: adminEmail,
      subject: `New Bornfidis Booking Inquiry`,
      html: `
        <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; line-height: 1.6;">
          <h2 style="color: #1a5f3f; margin-bottom: 16px;">New Booking Inquiry</h2>
          
          <ul style="list-style: none; padding: 0;">
            <li style="margin-bottom: 8px;"><strong>Name:</strong> ${bookingData.name}</li>
            <li style="margin-bottom: 8px;"><strong>Email:</strong> ${bookingData.email || 'Not provided'}</li>
            <li style="margin-bottom: 8px;"><strong>Event Date:</strong> ${eventDateFormatted}</li>
          </ul>

          <p style="margin-top: 16px;">
            View this booking in the admin dashboard.
          </p>
        </div>
      `,
    })
    console.log('✅ Admin notification email sent successfully')
    return { success: true, data: result }
  } catch (error: any) {
    console.error('❌ Error sending admin notification email:', error)
    return { success: false, error: error.message || 'Failed to send email' }
  }
}

/**
 * Phase 1.5: Send booking approved email to customer
 */
export async function sendBookingApprovedEmail(
  to: string,
  name: string,
  eventDate: string
) {
  if (!resend) {
    console.warn('⚠️ RESEND_API_KEY not set — email skipped')
    return { success: false, error: 'Email service not configured' }
  }

  if (!to || !to.includes('@')) {
    console.error('Invalid email address:', to)
    return { success: false, error: 'Invalid email address' }
  }

  try {
    // Format event date for display
    const eventDateFormatted = new Date(eventDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })

    console.log('📧 Sending booking approved email to:', to)
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: 'Your booking is confirmed 🎉',
      html: `
        <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; line-height: 1.6;">
          <h2 style="color: #1a5f3f; margin-bottom: 16px;">Your booking is confirmed 🎉</h2>

          <p>Hi ${name},</p>

          <p>
            We're happy to confirm your Bornfidis event for
            <strong>${eventDateFormatted}</strong>.
          </p>

          <p>
            A team member will follow up shortly with next steps.
          </p>

          <p style="margin-top: 24px;">
            With gratitude,<br/>
            <strong>Bornfidis Provisions</strong><br/>
            Food • Community • Trust
          </p>
        </div>
      `,
    })
    console.log('✅ Booking approved email sent successfully')
    return { success: true, data: result }
  } catch (error: any) {
    console.error('❌ Error sending booking approved email:', error)
    return { success: false, error: error.message || 'Failed to send email' }
  }
}

/**
 * Phase 1.5: Send booking declined email to customer
 */
export async function sendBookingDeclinedEmail(
  to: string,
  name: string
) {
  if (!resend) {
    console.warn('⚠️ RESEND_API_KEY not set — email skipped')
    return { success: false, error: 'Email service not configured' }
  }

  if (!to || !to.includes('@')) {
    console.error('Invalid email address:', to)
    return { success: false, error: 'Invalid email address' }
  }

  try {
    console.log('📧 Sending booking declined email to:', to)
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: 'Regarding your Bornfidis inquiry',
      html: `
        <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; line-height: 1.6;">
          <h2 style="color: #1a5f3f; margin-bottom: 16px;">Thank you for your inquiry</h2>

          <p>Hi ${name},</p>

          <p>
            Thank you for reaching out to Bornfidis.
            Unfortunately, we're unable to support this request at this time.
          </p>

          <p>
            We truly appreciate your interest and encourage you to reach out again.
          </p>

          <p style="margin-top: 24px;">
            Respectfully,<br/>
            <strong>Bornfidis Provisions</strong>
          </p>
        </div>
      `,
    })
    console.log('✅ Booking declined email sent successfully')
    return { success: true, data: result }
  } catch (error: any) {
    console.error('❌ Error sending booking declined email:', error)
    return { success: false, error: error.message || 'Failed to send email' }
  }
}

/**
 * Phase 4A: Send invoice email to customer
 * Includes invoice details and payment confirmation
 */
export async function sendInvoiceEmail(
  to: string,
  name: string,
  bookingData: {
    bookingId: string
    invoiceNumber: string
    invoiceDate: string
    totalAmount: string
    depositPaid: string
    balancePaid: string
    invoicePdfUrl?: string
  }
) {
  if (!resend) {
    console.error('Resend client not initialized. Check RESEND_API_KEY in .env.local')
    return { success: false, error: 'Email service not configured' }
  }

  if (!to || !to.includes('@')) {
    console.error('Invalid email address:', to)
    return { success: false, error: 'Invalid email address' }
  }

  try {
    console.log('Sending invoice email to:', to)

    const emailOptions: any = {
      from: FROM_EMAIL,
      to,
      subject: `Invoice #${bookingData.invoiceNumber} - Bornfidis Provisions`,
      html: `
        <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #002747;">Invoice #${bookingData.invoiceNumber}</h1>
          <p>Dear ${name},</p>
          
          <p>Thank you for your payment! Your booking is now fully paid.</p>
          
          <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #FFBC00;">
            <h2 style="color: #002747; margin-top: 0;">Payment Summary</h2>
            <ul style="line-height: 1.8; list-style: none; padding: 0;">
              <li style="margin-bottom: 10px;"><strong>Total Amount:</strong> ${bookingData.totalAmount}</li>
              <li style="margin-bottom: 10px;"><strong>Deposit Paid:</strong> ${bookingData.depositPaid}</li>
              <li style="margin-bottom: 10px;"><strong>Balance Paid:</strong> ${bookingData.balancePaid}</li>
              <li style="margin-top: 15px; padding-top: 15px; border-top: 2px solid #FFBC00;"><strong style="font-size: 18px; color: #22c55e;">Status: Fully Paid ✓</strong></li>
            </ul>
          </div>
          
          <p>Your invoice details are below. Please keep this email for your records.</p>
          
          <p style="margin-top: 30px;">We look forward to serving you!</p>
          
          <p style="margin-top: 30px; color: #666;">
            Blessings,<br>
            Chef Brian Bornfidis<br>
            Bornfidis Provisions
          </p>
          
          <p style="margin-top: 30px; font-size: 12px; color: #999; font-style: italic; text-align: center; padding: 20px; background: #f5f5f5; border-radius: 4px;">
            "May the Lord bless you and keep you;<br>
            the Lord make his face shine on you and be gracious to you;<br>
            the Lord turn his face toward you and give you peace."<br>
            <strong>— Numbers 6:24-26</strong>
          </p>
        </div>
      `,
    }

    // Add PDF attachment if URL provided (future: when PDF storage is implemented)
    if (bookingData.invoicePdfUrl) {
      try {
        const pdfResponse = await fetch(bookingData.invoicePdfUrl)
        if (pdfResponse.ok) {
          const pdfBuffer = await pdfResponse.arrayBuffer()
          emailOptions.attachments = [
            {
              filename: `invoice-${bookingData.invoiceNumber}.pdf`,
              content: Buffer.from(pdfBuffer),
            },
          ]
        }
      } catch (attachError) {
        console.warn('Could not attach PDF to email:', attachError)
        // Continue without attachment
      }
    }

    const result = await resend.emails.send(emailOptions)
    console.log('✅ Invoice email sent successfully:', result)
    return { success: true, data: result }
  } catch (error: any) {
    console.error('❌ Error sending invoice email:', error)
    return { success: false, error: error.message || 'Failed to send email' }
  }
}

/**
 * Phase 5B: Send Stripe Connect onboarding email to chef
 */
export async function sendChefOnboardingEmail(
  to: string,
  name: string,
  data: {
    onboarding_url: string
    chef_name: string
  }
) {
  if (!resend) {
    console.warn('⚠️  Resend not configured. Skipping onboarding email.')
    return { success: false, error: 'Email service not configured' }
  }

  if (!to || !to.includes('@')) {
    console.error('Invalid email address:', to)
    return { success: false, error: 'Invalid email address' }
  }

  try {
    console.log('Sending onboarding email to:', to)
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: 'Complete Your Stripe Onboarding - Bornfidis Chef Network',
      html: `
        <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #1a5f3f;">Welcome to the Bornfidis Chef Network, ${data.chef_name}!</h1>
          
          <p>Your application has been approved! To start receiving bookings and payouts, please complete your Stripe Connect onboarding.</p>
          
          <div style="background-color: #f0f9f4; border-left: 4px solid #1a5f3f; padding: 16px; margin: 24px 0;">
            <p style="margin: 0; font-weight: 600; color: #1a5f3f;">Next Steps:</p>
            <ol style="margin: 12px 0 0 0; padding-left: 20px; line-height: 1.8;">
              <li>Click the button below to start onboarding</li>
              <li>Complete your Stripe account setup (takes ~5 minutes)</li>
              <li>Once complete, you'll be able to receive bookings and payouts</li>
            </ol>
          </div>
          
          <div style="text-align: center; margin: 32px 0;">
            <a href="${data.onboarding_url}" 
               style="display: inline-block; background-color: #1a5f3f; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
              Complete Stripe Onboarding
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px; margin-top: 24px;">
            <strong>Note:</strong> This link expires in 24 hours. If you need a new link, please contact us.
          </p>
          
          <p style="margin-top: 32px; color: #666;">
            Questions? Reply to this email or reach us at brian@bornfidis.com
          </p>
          
          <p style="margin-top: 24px; color: #666; font-style: italic;">
            "Whatever you do, work at it with all your heart, as working for the Lord, not for human masters."<br>
            <strong>— Colossians 3:23</strong>
          </p>
          
          <p style="margin-top: 32px; color: #666;">
            Looking forward to partnering with you!<br>
            <strong>Chef Brian Bornfidis</strong><br>
            Bornfidis Provisions
          </p>
        </div>
      `,
    })
    console.log('✅ Onboarding email sent successfully:', result)
    return { success: true, data: result }
  } catch (error: any) {
    console.error('❌ Error sending onboarding email:', error)
    return { success: false, error: error.message || 'Failed to send email' }
  }
}
