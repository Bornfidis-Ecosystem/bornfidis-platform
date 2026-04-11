import { z } from 'zod'
import { generateAgentQuote, type EventInquiry } from '@/lib/anthropic-quote-agent'
import { isQuoteAutoSendEnabled } from '@/lib/quote-auto-send'
import { loadQuoteAgentContext } from '@/lib/quote-generate-context'
import { saveQuoteToDatabase, markPrismaQuoteSent } from '@/lib/save-agent-quote-db'
import { sendQuoteEmail } from '@/lib/quote-email'

export const InquiryBodySchema = z
  .object({
    client_name: z.string().min(1),
    client_email: z.string().email(),
    client_phone: z.string().optional(),
    event_type: z.string().min(1),
    event_date: z.string().min(1),
    guest_count: z.coerce.number().int().positive(),
    location: z.string().min(1),
    dietary_notes: z.string().optional(),
    budget_indication: z.string().optional(),
    additional_notes: z.string().optional(),
    existing_booking_id: z.string().uuid().optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.existing_booking_id) {
      const phone = data.client_phone?.trim()
      if (!phone || phone.length < 7) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'client_phone is required (min 7 chars) when existing_booking_id is omitted',
          path: ['client_phone'],
        })
      }
    }
  })

export type InquiryBody = z.infer<typeof InquiryBodySchema>

export type AiQuoteSuccessResponse = {
  success: true
  review_pending?: false
  quote_id: string
  booking_id: string
  quote_number: string
  total_usd: number
  deposit_usd: number
  confidence: 'high' | 'medium' | 'low'
  confidence_reason: string | null
}

export type AiQuotePendingReviewResponse = {
  success: true
  review_pending: true
  quote_id: string
  booking_id: string
  quote_number: string
  total_usd: number
  deposit_usd: number
  confidence: 'high' | 'medium' | 'low'
  confidence_reason: string | null
}

export type AiQuoteEmailFailedResponse = {
  success: false
  error: string
  quote_id: string
  booking_id: string
  quote_number: string
}

/**
 * Runs Claude → DB; optionally Resend → mark sent (see `QUOTE_AUTO_SEND`).
 * Email failure returns 502 without throwing.
 */
export async function runAiQuoteGeneration(
  data: InquiryBody,
): Promise<
  | { kind: 'success'; body: AiQuoteSuccessResponse }
  | { kind: 'pending_review'; body: AiQuotePendingReviewResponse }
  | { kind: 'email_failed'; status: 502; body: AiQuoteEmailFailedResponse }
> {
  const { existing_booking_id, ...inquiryFields } = data
  const inquiry: EventInquiry = inquiryFields

  const context = await loadQuoteAgentContext(inquiry)
  const agentQuote = await generateAgentQuote(context)

  const { booking_id, quote_id, quote_number } = await saveQuoteToDatabase(
    inquiry,
    agentQuote,
    existing_booking_id,
  )

  const baseTotals = {
    quote_id,
    booking_id,
    quote_number,
    total_usd: agentQuote.total_usd,
    deposit_usd: agentQuote.deposit_amount_usd,
    confidence: agentQuote.confidence,
    confidence_reason: agentQuote.confidence_reason ?? null,
  }

  if (!isQuoteAutoSendEnabled()) {
    return {
      kind: 'pending_review',
      body: {
        success: true,
        review_pending: true,
        ...baseTotals,
      },
    }
  }

  const emailResult = await sendQuoteEmail(inquiry, agentQuote, quote_number)
  if (!emailResult.success) {
    return {
      kind: 'email_failed',
      status: 502,
      body: {
        success: false,
        error: emailResult.error || 'Quote saved but email failed',
        quote_id,
        booking_id,
        quote_number,
      },
    }
  }

  await markPrismaQuoteSent(quote_id)

  return {
    kind: 'success',
    body: {
      success: true,
      review_pending: false,
      ...baseTotals,
    },
  }
}
