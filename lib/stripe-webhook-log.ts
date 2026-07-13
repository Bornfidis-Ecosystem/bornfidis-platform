import { db } from '@/lib/db'

export type WebhookLogStatus = 'received' | 'matched' | 'unmatched' | 'error'

export async function writeStripeWebhookLog(input: {
  eventType: string
  stripeEventId?: string | null
  stripeObjectId: string
  paymentIntentId?: string | null
  amountCents?: number | null
  customerEmail?: string | null
  matchedBookingId?: string | null
  processingStatus: WebhookLogStatus
  errorMessage?: string | null
  paymentType?: string | null
  rawPayload?: unknown
}): Promise<string | null> {
  try {
    const row = await db.stripeWebhookLog.create({
      data: {
        eventType: input.eventType,
        stripeEventId: input.stripeEventId ?? undefined,
        stripeObjectId: input.stripeObjectId,
        paymentIntentId: input.paymentIntentId ?? undefined,
        amountCents: input.amountCents ?? undefined,
        customerEmail: input.customerEmail?.trim().toLowerCase() || undefined,
        matchedBookingId: input.matchedBookingId ?? undefined,
        processingStatus: input.processingStatus,
        errorMessage: input.errorMessage ?? undefined,
        paymentType: input.paymentType ?? undefined,
        rawPayload: input.rawPayload === undefined ? undefined : (input.rawPayload as object),
      },
      select: { id: true },
    })
    return row.id
  } catch (e: unknown) {
    const code = (e as { code?: string })?.code
    if (code === 'P2002' && input.stripeEventId) {
      try {
        await db.stripeWebhookLog.update({
          where: { stripeEventId: input.stripeEventId },
          data: {
            processingStatus: input.processingStatus,
            matchedBookingId: input.matchedBookingId ?? undefined,
            errorMessage: input.errorMessage ?? undefined,
          },
        })
      } catch (updateErr) {
        console.error('stripe_webhook_log update failed:', updateErr)
      }
      return null
    }
    console.error('stripe_webhook_log write failed:', e)
    return null
  }
}

export async function listUnmatchedStripePayments(limit = 50) {
  return db.stripeWebhookLog.findMany({
    where: { processingStatus: 'unmatched' },
    orderBy: { receivedAt: 'desc' },
    take: limit,
  })
}

export async function listStripeWebhookLogs(opts?: {
  status?: string
  limit?: number
}) {
  return db.stripeWebhookLog.findMany({
    where: opts?.status ? { processingStatus: opts.status } : undefined,
    orderBy: { receivedAt: 'desc' },
    take: opts?.limit ?? 100,
    include: {
      matchedBooking: {
        select: { id: true, name: true, email: true, eventDate: true },
      },
    },
  })
}
