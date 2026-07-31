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

export async function syncAdminInvoiceRecord(params: {
  stripeInvoiceId: string
  division: StripeDivision
  actorName?: string
  status?: AdminInvoiceStatus
  sentAt?: Date | null
  paidAt?: Date | null
  hostedInvoiceUrl?: string | null
  invoiceNumber?: string | null
}) {
  const data: Record<string, unknown> = {}
  if (params.status) data.status = params.status
  if (params.sentAt !== undefined) data.sentAt = params.sentAt
  if (params.paidAt !== undefined) data.paidAt = params.paidAt
  if (params.hostedInvoiceUrl !== undefined) data.hostedInvoiceUrl = params.hostedInvoiceUrl
  if (params.invoiceNumber !== undefined) data.invoiceNumber = params.invoiceNumber

  if (Object.keys(data).length === 0) return

  await db.adminInvoice.updateMany({
    where: { stripeInvoiceId: params.stripeInvoiceId, division: params.division },
    data,
  })

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
