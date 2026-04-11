import { Resend } from 'resend'
import { sendQuoteOfferEmail } from '@/lib/email'
import { formatUSD, dollarsToCents } from '@/lib/money'
import { getQuoteDepositTestimonialSnippet } from '@/lib/homepage-testimonials'
import type { AgentQuote, EventInquiry } from '@/lib/anthropic-quote-agent'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

const QUOTE_FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL != null && process.env.RESEND_FROM_EMAIL !== ''
    ? `Bornfidis Provisions <${process.env.RESEND_FROM_EMAIL}>`
    : 'Bornfidis Provisions <onboarding@resend.dev>'

const QUOTE_REPLY_TO = process.env.RESEND_REPLY_TO?.trim() || 'hello@bornfidis.com'

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function usd(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

function formatEventDateLong(d: Date): string {
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function numToCents(n: number): number {
  return dollarsToCents(n)
}

function buildQuoteEmailHtml(
  inquiry: EventInquiry,
  quote: AgentQuote,
  quoteNumber: string,
): string {
  const lineItemRows = quote.line_items
    .map(
      (item) => `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #f0ede8;font-size:14px;color:#2c2c2a">${escapeHtml(item.description)}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #f0ede8;font-size:14px;color:#5f5e5a;text-align:center">${escapeHtml(String(item.quantity))} ${escapeHtml(item.unit)}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #f0ede8;font-size:14px;color:#5f5e5a;text-align:right">${usd(item.unit_price_usd)}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #f0ede8;font-size:14px;color:#2c2c2a;text-align:right;font-weight:500">${usd(item.subtotal_usd)}</td>
      </tr>`,
    )
    .join('')

  const expiryDate = new Date()
  expiryDate.setDate(expiryDate.getDate() + (quote.expires_days ?? 14))
  const expiryFormatted = expiryDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const eventDateDisplay = (() => {
    try {
      return formatEventDateLong(new Date(`${inquiry.event_date.trim()}T12:00:00.000Z`))
    } catch {
      return inquiry.event_date
    }
  })()

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#faf9f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <div style="max-width:600px;margin:40px auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e8e5df">

    <div style="background:#0f6e56;padding:32px 40px">
      <p style="margin:0;font-size:22px;font-weight:500;color:#ffffff;letter-spacing:-0.3px">Bornfidis Provisions</p>
      <p style="margin:6px 0 0;font-size:13px;color:#9fe1cb;letter-spacing:0.05em;text-transform:uppercase">Port Antonio, Jamaica</p>
    </div>

    <div style="padding:32px 40px 0">
      <p style="margin:0 0 4px;font-size:12px;color:#888780;text-transform:uppercase;letter-spacing:0.08em">Event Quote · ${escapeHtml(quoteNumber)}</p>
      <h1 style="margin:0 0 24px;font-size:20px;font-weight:500;color:#2c2c2a">${escapeHtml(inquiry.event_type)}</h1>
      <p style="margin:0 0 24px;font-size:15px;color:#444441;line-height:1.7">${escapeHtml(quote.customer_notes).replace(/\n/g, '<br/>')}</p>
    </div>

    <div style="margin:0 40px;padding:16px 20px;background:#f5f3ee;border-radius:8px">
      <table style="width:100%;border-collapse:collapse">
        <tr>
          <td style="font-size:12px;color:#888780;padding:4px 0;text-transform:uppercase;letter-spacing:0.05em">Date</td>
          <td style="font-size:13px;color:#2c2c2a;padding:4px 0;text-align:right;font-weight:500">${escapeHtml(eventDateDisplay)}</td>
        </tr>
        <tr>
          <td style="font-size:12px;color:#888780;padding:4px 0;text-transform:uppercase;letter-spacing:0.05em">Guests</td>
          <td style="font-size:13px;color:#2c2c2a;padding:4px 0;text-align:right;font-weight:500">${escapeHtml(String(inquiry.guest_count))}</td>
        </tr>
        <tr>
          <td style="font-size:12px;color:#888780;padding:4px 0;text-transform:uppercase;letter-spacing:0.05em">Location</td>
          <td style="font-size:13px;color:#2c2c2a;padding:4px 0;text-align:right;font-weight:500">${escapeHtml(inquiry.location)}</td>
        </tr>
      </table>
    </div>

    <div style="padding:24px 40px 0">
      <p style="margin:0 0 12px;font-size:12px;color:#888780;text-transform:uppercase;letter-spacing:0.08em">Services &amp; Provisions</p>
      <table style="width:100%;border-collapse:collapse;border:1px solid #f0ede8;border-radius:8px;overflow:hidden">
        <thead>
          <tr style="background:#faf9f7">
            <th style="padding:10px 12px;font-size:12px;color:#888780;text-align:left;font-weight:500;text-transform:uppercase;letter-spacing:0.05em">Item</th>
            <th style="padding:10px 12px;font-size:12px;color:#888780;text-align:center;font-weight:500;text-transform:uppercase;letter-spacing:0.05em">Qty</th>
            <th style="padding:10px 12px;font-size:12px;color:#888780;text-align:right;font-weight:500;text-transform:uppercase;letter-spacing:0.05em">Rate</th>
            <th style="padding:10px 12px;font-size:12px;color:#888780;text-align:right;font-weight:500;text-transform:uppercase;letter-spacing:0.05em">Amount</th>
          </tr>
        </thead>
        <tbody>${lineItemRows}</tbody>
      </table>
    </div>

    <div style="padding:20px 40px">
      <table style="width:100%;border-collapse:collapse">
        <tr>
          <td style="font-size:13px;color:#888780;padding:4px 0">Subtotal</td>
          <td style="font-size:13px;color:#2c2c2a;padding:4px 0;text-align:right">${usd(quote.subtotal_usd)}</td>
        </tr>
        ${quote.tax_usd > 0 ? `<tr><td style="font-size:13px;color:#888780;padding:4px 0">Tax</td><td style="font-size:13px;color:#2c2c2a;padding:4px 0;text-align:right">${usd(quote.tax_usd)}</td></tr>` : ''}
        ${quote.discount_usd > 0 ? `<tr><td style="font-size:13px;color:#888780;padding:4px 0">Discount</td><td style="font-size:13px;color:#085041;padding:4px 0;text-align:right">−${usd(quote.discount_usd)}</td></tr>` : ''}
        <tr style="border-top:1px solid #e8e5df">
          <td style="font-size:15px;font-weight:500;color:#2c2c2a;padding:12px 0 4px">Total</td>
          <td style="font-size:15px;font-weight:500;color:#2c2c2a;padding:12px 0 4px;text-align:right">${usd(quote.total_usd)}</td>
        </tr>
        <tr>
          <td style="font-size:13px;color:#888780;padding:4px 0">Deposit required (${escapeHtml(String(quote.deposit_percentage))}%)</td>
          <td style="font-size:13px;color:#0f6e56;font-weight:500;padding:4px 0;text-align:right">${usd(quote.deposit_amount_usd)}</td>
        </tr>
      </table>
    </div>

    <div style="margin:0 40px;padding:16px 20px;background:#e1f5ee;border-radius:8px;border-left:3px solid #0f6e56;border-radius:0 8px 8px 0">
      <p style="margin:0 0 4px;font-size:12px;color:#0f6e56;font-weight:500;text-transform:uppercase;letter-spacing:0.05em">Payment terms</p>
      <p style="margin:0;font-size:13px;color:#085041">${escapeHtml(quote.payment_terms).replace(/\n/g, '<br/>')}</p>
    </div>

    <div style="padding:24px 40px 32px;margin-top:20px;border-top:1px solid #f0ede8">
      <p style="margin:0 0 6px;font-size:12px;color:#b4b2a9">This quote is valid until ${escapeHtml(expiryFormatted)}.</p>
      <p style="margin:0;font-size:12px;color:#b4b2a9">Questions? Reply to this email or reach us at ${escapeHtml(QUOTE_REPLY_TO)}</p>
    </div>

  </div>
</body>
</html>`
}

export type PersistedQuoteBookingEmailFields = {
  id: string
  customer_name: string
  customer_email: string | null
  event_date: Date
  location: string
  guest_count: number | null
}

export type PersistedQuoteTotalsFields = {
  total_usd: unknown
  deposit_percentage: number | null
  deposit_amount_usd: unknown
}

export type PersistedQuoteLineForEmail = {
  quantity: number | null
  item_name: string
  unit_price_usd: unknown
}

/**
 * Sends quote offer via Resend after DB persistence.
 *
 * `getQuoteDepositTestimonialSnippet` reads `booking_inquiries`; relational `bookings.id`
 * is a different ID space. Pass `bookingInquiryIdForTestimonial` when you have a linked inquiry row.
 */
export async function sendPersistedQuoteOfferEmail(input: {
  booking: PersistedQuoteBookingEmailFields
  quote: PersistedQuoteTotalsFields
  lineItems: PersistedQuoteLineForEmail[]
  quoteNotes?: string | null
  paymentInstructions?: string
  bookingInquiryIdForTestimonial?: string | null
}): Promise<{ success: boolean; error?: string }> {
  const to = input.booking.customer_email?.trim()
  if (!to?.includes('@')) {
    return { success: false, error: 'Client email is missing on booking.' }
  }

  const totalCents = numToCents(Number(input.quote.total_usd))
  const depositCents = numToCents(Number(input.quote.deposit_amount_usd ?? 0))
  const depositPct = input.quote.deposit_percentage ?? 50

  const experienceLines =
    input.lineItems.length > 0
      ? input.lineItems
          .map((l) => {
            const q = l.quantity ?? 1
            const lineCents = numToCents(Number(l.unit_price_usd)) * q
            return `• ${l.item_name} (${q}×) — ${formatUSD(lineCents)}`
          })
          .join('\n')
      : 'Custom Bornfidis chef experience'

  const experienceSummary = [experienceLines, input.quoteNotes?.trim() ? `\nNotes: ${input.quoteNotes.trim()}` : '']
    .filter(Boolean)
    .join('')

  const quoteEmailTestimonial = await getQuoteDepositTestimonialSnippet(
    input.bookingInquiryIdForTestimonial ?? undefined,
  )

  return sendQuoteOfferEmail({
    to,
    clientName: input.booking.customer_name.trim(),
    eventDate: formatEventDateLong(input.booking.event_date),
    location: input.booking.location,
    guests:
      input.booking.guest_count != null && input.booking.guest_count > 0
        ? `${input.booking.guest_count} guest${input.booking.guest_count === 1 ? '' : 's'}`
        : '—',
    experienceSummary,
    estimatedTotal: formatUSD(totalCents),
    depositPercent: depositPct,
    depositAmount: formatUSD(depositCents),
    paymentInstructions:
      input.paymentInstructions ||
      'We will send a secure payment link once you confirm.',
    quoteEmailTestimonial,
  })
}

/**
 * Branded HTML quote email (Resend) for AI/agent flow after `saveQuoteToDatabase`.
 */
export async function sendQuoteEmail(
  inquiry: EventInquiry,
  agentQuote: AgentQuote,
  quoteNumber: string,
): Promise<{ success: boolean; error?: string; id?: string }> {
  const to = inquiry.client_email?.trim()
  if (!to?.includes('@')) {
    return { success: false, error: 'Invalid client email' }
  }

  if (!resend) {
    return { success: false, error: 'Email service not configured' }
  }

  const html = buildQuoteEmailHtml(inquiry, agentQuote, quoteNumber)
  const subject = `Your Bornfidis Quote — ${inquiry.event_type} · ${quoteNumber}`

  try {
    const { data, error } = await resend.emails.send({
      from: QUOTE_FROM_EMAIL,
      to,
      replyTo: QUOTE_REPLY_TO,
      subject,
      html,
    })

    if (error || !data?.id) {
      return {
        success: false,
        error: error?.message || JSON.stringify(error) || 'Resend send failed',
      }
    }

    return { success: true, id: data.id }
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Resend send failed'
    return { success: false, error: message }
  }
}
