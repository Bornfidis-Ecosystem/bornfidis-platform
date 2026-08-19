import { db } from '@/lib/db'
import { logWorkflowTransition } from '@/lib/activity-log'
import { logEmailSend } from '@/lib/email-send-log'
import { getStripeClient, type StripeDivision } from '@/lib/stripe'
import type Stripe from 'stripe'

export const ADMIN_INVOICE_CURRENCIES = ['usd'] as const
export type AdminInvoiceCurrency = (typeof ADMIN_INVOICE_CURRENCIES)[number]

export const ADMIN_INVOICE_STATUSES = [
  'draft',
  'open',
  'sent',
  'paid',
  'overdue',
  'void',
  'payment_failed',
  'refunded',
  'disputed',
] as const

export type AdminInvoiceStatus = (typeof ADMIN_INVOICE_STATUSES)[number]
export type AdminInvoiceSourceType = 'booking' | 'quote' | 'project' | 'proposal'

export type AdminInvoicePrefill = {
  sourceType: AdminInvoiceSourceType
  sourceId: string
  division: StripeDivision
  divisionLocked: boolean
  clientName: string
  clientEmail: string
  clientId?: string | null
  bookingId?: string | null
  projectId?: string | null
  lineItems: Array<{ description: string; unitAmount: number; quantity: number }>
  depositReceived?: number
  depositDate?: string
  dueDate?: string
}

export async function getStripeOwnAccountId(division: StripeDivision): Promise<string> {
  const stripe = getStripeClient(division)
  const account = (await stripe.accounts.retrieve()) as Stripe.Account
  return account.id
}

export async function getAdminInvoicePrefill(
  sourceType: AdminInvoiceSourceType,
  sourceId: string,
): Promise<AdminInvoicePrefill | null> {
  if (!sourceId.trim()) return null

  if (sourceType === 'booking' || sourceType === 'quote') {
    const booking = await db.bookingInquiry.findUnique({
      where: { id: sourceId },
      select: {
        id: true,
        name: true,
        email: true,
        clientProfileId: true,
        depositAmountCents: true,
        paidAt: true,
        quoteLineItems: true,
        quoteTotalCents: true,
        balanceAmountCents: true,
        eventDate: true,
      },
    })
    if (!booking) return null

    const rawLineItems = Array.isArray(booking.quoteLineItems)
      ? (booking.quoteLineItems as Array<{ title?: string; quantity?: number; unit_price_cents?: number }>)
      : []
    const lineItems =
      rawLineItems.length > 0
        ? rawLineItems.map((item) => ({
            description: item.title?.trim() || 'Private dining services',
            quantity: item.quantity && item.quantity > 0 ? item.quantity : 1,
            unitAmount: ((item.unit_price_cents ?? 0) / 100) || 0,
          }))
        : [
            {
              description: 'Private dining services',
              quantity: 1,
              unitAmount: ((booking.balanceAmountCents ?? booking.quoteTotalCents ?? 0) / 100) || 0,
            },
          ]

    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + 7)

    return {
      sourceType,
      sourceId: booking.id,
      division: 'provisions',
      divisionLocked: true,
      clientName: booking.name,
      clientEmail: booking.email ?? '',
      clientId: booking.clientProfileId,
      bookingId: booking.id,
      lineItems,
      depositReceived: booking.depositAmountCents ? booking.depositAmountCents / 100 : undefined,
      depositDate: booking.paidAt ? booking.paidAt.toISOString().slice(0, 10) : undefined,
      dueDate: dueDate.toISOString().slice(0, 10),
    }
  }

  if (sourceType === 'project') {
    const project = await db.digitalStudioProject.findUnique({
      where: { id: sourceId },
      select: {
        id: true,
        name: true,
        clientName: true,
        clientEmail: true,
        totalAmountCents: true,
        depositAmountCents: true,
        depositPaidAt: true,
        balanceAmountCents: true,
        targetLaunchDate: true,
      },
    })
    if (!project) return null

    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + 7)

    return {
      sourceType,
      sourceId: project.id,
      division: 'digital-studio',
      divisionLocked: true,
      clientName: project.clientName,
      clientEmail: project.clientEmail,
      projectId: project.id,
      lineItems: [
        {
          description: project.name,
          quantity: 1,
          unitAmount: Math.max(
            ((project.balanceAmountCents ?? project.totalAmountCents ?? 0) / 100) || 0,
            1,
          ),
        },
      ],
      depositReceived: project.depositAmountCents ? project.depositAmountCents / 100 : undefined,
      depositDate: project.depositPaidAt ? project.depositPaidAt.toISOString().slice(0, 10) : undefined,
      dueDate: dueDate.toISOString().slice(0, 10),
    }
  }

  const application = await db.digitalStudioApplication.findUnique({
    where: { id: sourceId },
    select: {
      id: true,
      businessName: true,
      contactName: true,
      contactEmail: true,
    },
  })
  if (!application) return null

  const dueDate = new Date()
  dueDate.setDate(dueDate.getDate() + 7)

  return {
    sourceType,
    sourceId: application.id,
    division: 'digital-studio',
    divisionLocked: true,
    clientName: application.contactName,
    clientEmail: application.contactEmail,
    lineItems: [
      {
        description: `${application.businessName} website proposal (confirm amount before sending)`,
        unitAmount: 1,
        quantity: 1,
      },
    ],
    dueDate: dueDate.toISOString().slice(0, 10),
  }
}

function stripeCustomerId(invoice: Stripe.Invoice): string | null {
  if (typeof invoice.customer === 'string') return invoice.customer
  if (invoice.customer && typeof invoice.customer === 'object' && 'id' in invoice.customer) {
    return (invoice.customer as Stripe.Customer).id
  }
  return null
}

function mapStripeInvoiceStatus(
  stripeStatus: Stripe.Invoice.Status | null | undefined,
  fallback?: AdminInvoiceStatus,
): AdminInvoiceStatus {
  switch (stripeStatus) {
    case 'draft':
      return 'draft'
    case 'open':
      return 'open'
    case 'paid':
      return 'paid'
    case 'void':
      return 'void'
    case 'uncollectible':
      return 'void'
    default:
      return fallback || 'open'
  }
}

/**
 * Upsert local admin_invoices from a Stripe invoice event.
 * Previously this only updateMany'd — invoices created outside the admin UI
 * (scripts, Dashboard, other tools) never appeared in the ledger.
 */
export async function syncAdminInvoiceRecord(params: {
  stripeInvoiceId: string
  division: StripeDivision
  actorName?: string
  status?: AdminInvoiceStatus
  sentAt?: Date | null
  paidAt?: Date | null
  hostedInvoiceUrl?: string | null
  invoiceNumber?: string | null
  /** When provided, creates a local row if none exists (Stripe → ledger sync). */
  stripeInvoice?: Stripe.Invoice
}) {
  const data: Record<string, unknown> = {}
  if (params.status) data.status = params.status
  if (params.sentAt !== undefined) data.sentAt = params.sentAt
  if (params.paidAt !== undefined) data.paidAt = params.paidAt
  if (params.hostedInvoiceUrl !== undefined) data.hostedInvoiceUrl = params.hostedInvoiceUrl
  if (params.invoiceNumber !== undefined) data.invoiceNumber = params.invoiceNumber

  const updated =
    Object.keys(data).length === 0
      ? { count: 0 }
      : await db.adminInvoice.updateMany({
          where: { stripeInvoiceId: params.stripeInvoiceId, division: params.division },
          data,
        })

  if (updated.count === 0 && params.stripeInvoice) {
    const invoice = params.stripeInvoice
    const customerId = stripeCustomerId(invoice)
    if (!customerId) {
      console.error(
        `[syncAdminInvoiceRecord] cannot create local row for ${params.stripeInvoiceId}: missing customer`,
      )
    } else {
      const stripeAccountId = await getStripeOwnAccountId(params.division)
      const status = params.status || mapStripeInvoiceStatus(invoice.status)
      const meta = invoice.metadata || {}
      await db.adminInvoice.create({
        data: {
          division: params.division,
          sourceType: typeof meta.source_type === 'string' ? meta.source_type : null,
          sourceId: typeof meta.source_id === 'string' ? meta.source_id : null,
          bookingId: typeof meta.booking_id === 'string' ? meta.booking_id || null : null,
          projectId: typeof meta.project_id === 'string' ? meta.project_id || null : null,
          stripeAccountId,
          stripeCustomerId: customerId,
          stripeInvoiceId: invoice.id,
          invoiceNumber: params.invoiceNumber ?? invoice.number,
          currency: (invoice.currency || 'usd').toLowerCase(),
          subtotalCents: invoice.subtotal ?? invoice.total ?? 0,
          depositAppliedCents: 0,
          amountDueCents: invoice.amount_due ?? 0,
          dueAt: invoice.due_date ? new Date(invoice.due_date * 1000) : null,
          status,
          hostedInvoiceUrl: params.hostedInvoiceUrl ?? invoice.hosted_invoice_url,
          sentAt: params.sentAt ?? null,
          paidAt: params.paidAt ?? null,
          metadata: {
            recipient: invoice.customer_email || null,
            clientName: invoice.customer_name || null,
            livemode: invoice.livemode,
            syncedFrom: 'stripe_webhook',
            actorName: params.actorName || 'System',
          },
        },
      })
    }
  } else if (updated.count === 0 && Object.keys(data).length > 0) {
    console.warn(
      `[syncAdminInvoiceRecord] no local row for ${params.stripeInvoiceId} (${params.division}); update skipped (no Stripe payload to upsert)`,
    )
  }

  if (params.status) {
    await logWorkflowTransition({
      division: params.division === 'provisions' ? 'PROVISIONS' : 'DIGITAL_STUDIO',
      entityType: 'admin_invoice',
      entityId: params.stripeInvoiceId,
      action: `invoice_${params.status}`,
      title: `Invoice ${params.status}`,
      actorName: params.actorName || 'System',
      newValue: params.status,
    })
  }
}

/** Import invoices from the configured Stripe account/mode into the local ledger. */
export async function importAdminInvoicesFromStripe(
  division: StripeDivision,
  options?: { limit?: number },
): Promise<{ imported: number; updated: number; scanned: number }> {
  const stripe = getStripeClient(division)
  const limit = Math.min(Math.max(options?.limit ?? 100, 1), 100)
  let imported = 0
  let updated = 0
  let scanned = 0
  let starting_after: string | undefined

  for (let page = 0; page < 10; page++) {
    const list = await stripe.invoices.list({ limit, starting_after })
    for (const invoice of list.data) {
      scanned += 1
      const existing = await db.adminInvoice.findFirst({
        where: { stripeInvoiceId: invoice.id, division },
        select: { id: true },
      })
      const status = mapStripeInvoiceStatus(invoice.status)
      await syncAdminInvoiceRecord({
        stripeInvoiceId: invoice.id,
        division,
        actorName: 'Stripe import',
        status,
        hostedInvoiceUrl: invoice.hosted_invoice_url,
        invoiceNumber: invoice.number,
        paidAt: invoice.status === 'paid' && invoice.status_transitions?.paid_at
          ? new Date(invoice.status_transitions.paid_at * 1000)
          : undefined,
        stripeInvoice: invoice,
      })
      if (existing) updated += 1
      else imported += 1
    }
    if (!list.has_more || list.data.length === 0) break
    starting_after = list.data[list.data.length - 1]?.id
  }

  return { imported, updated, scanned }
}

export type StripeKeyMode = 'test' | 'live' | 'unknown'

export function getConfiguredStripeKeyMode(division: StripeDivision): StripeKeyMode {
  const key =
    division === 'provisions'
      ? process.env.STRIPE_PROVISIONS_SECRET_KEY || process.env.STRIPE_SECRET_KEY || ''
      : process.env.STRIPE_DIGITAL_STUDIO_SECRET_KEY || ''
  const trimmed = key.trim()
  if (trimmed.startsWith('sk_test_')) return 'test'
  if (trimmed.startsWith('sk_live_')) return 'live'
  return 'unknown'
}

/**
 * Probe whether local ledger Stripe IDs are reachable with the configured key mode.
 * Detects the common gap: live invoices stored locally while env uses sk_test_ (or reverse).
 */
export async function diagnoseAdminInvoiceStripeAccess(
  division: StripeDivision,
  stripeInvoiceIds: string[],
): Promise<{
  mode: StripeKeyMode
  checked: number
  reachable: number
  modeMismatch: number
  missing: number
  sampleError?: string
}> {
  const mode = getConfiguredStripeKeyMode(division)
  const ids = stripeInvoiceIds.filter(Boolean).slice(0, 5)
  if (ids.length === 0) {
    return { mode, checked: 0, reachable: 0, modeMismatch: 0, missing: 0 }
  }

  const stripe = getStripeClient(division)
  let reachable = 0
  let modeMismatch = 0
  let missing = 0
  let sampleError: string | undefined

  for (const id of ids) {
    try {
      await stripe.invoices.retrieve(id)
      reachable += 1
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      if (!sampleError) sampleError = message
      if (/live mode|test mode/i.test(message)) modeMismatch += 1
      else missing += 1
    }
  }

  return { mode, checked: ids.length, reachable, modeMismatch, missing, sampleError }
}

export async function logAdminInvoiceEmail(params: {
  division: StripeDivision
  recipient: string
  success: boolean
  error?: string
  bookingId?: string | null
  projectId?: string | null
  invoiceId: string
  actorName?: string
}) {
  await logEmailSend({
    division: params.division,
    bookingId: params.bookingId ?? undefined,
    projectId: params.projectId ?? undefined,
    entityType: 'admin_invoice',
    entityId: params.invoiceId,
    templateType: 'admin_invoice_send',
    recipient: params.recipient,
    subject: 'Invoice from Bornfidis',
    success: params.success,
    error: params.error,
    actorName: params.actorName || 'System',
  })
}
