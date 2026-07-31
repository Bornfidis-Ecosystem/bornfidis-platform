'use server'

import { requireAuth } from '@/lib/auth'
import { requireAdminUser } from '@/lib/requireAdmin'
import { requireHospitalityOpsAccess } from '@/lib/admin-rbac'
import { getCurrentPrismaUser } from '@/lib/partner'
import { db } from '@/lib/db'
import {
  ADMIN_INVOICE_CURRENCIES,
  getAdminInvoicePrefill,
  getStripeOwnAccountId,
  logAdminInvoiceEmail,
  syncAdminInvoiceRecord,
  type AdminInvoiceCurrency,
  type AdminInvoicePrefill,
  type AdminInvoiceSourceType,
} from '@/lib/admin-invoices'
import { getStripeClient, isStripeConfigured, type StripeDivision } from '@/lib/stripe'
import type Stripe from 'stripe'

async function voidOrphanStripeInvoice(
  stripe: Stripe,
  invoiceId: string,
  reason: string,
): Promise<void> {
  try {
    await stripe.invoices.voidInvoice(invoiceId)
    console.warn(`[createAdminInvoice] voided orphan Stripe invoice ${invoiceId}: ${reason}`)
  } catch (voidErr) {
    console.error(
      `[createAdminInvoice] FAILED to void orphan Stripe invoice ${invoiceId} (${reason}):`,
      voidErr,
    )
  }
}

async function requireInvoiceFinanceAccess(): Promise<{ ok: true } | { ok: false; error: string }> {
  await requireAuth()
  await requireAdminUser()
  try {
    await requireHospitalityOpsAccess()
    return { ok: true }
  } catch {
    return {
      ok: false,
      error: 'Access denied: Hospitality operations role required to manage invoices.',
    }
  }
}

export type AdminInvoiceLineItem = {
  description: string
  unitAmount: number
  quantity: number
}

export type CreateAdminInvoiceInput = {
  division: StripeDivision | string
  clientName: string
  clientEmail: string
  bookingId?: string
  projectId?: string
  clientId?: string
  sourceType?: AdminInvoiceSourceType
  sourceId?: string
  lineItems: AdminInvoiceLineItem[]
  currency?: AdminInvoiceCurrency | string
  depositReceived?: number
  depositDate?: string
  dueDate: string
  footerNote?: string
}

export type CreateAdminInvoiceResult =
  | {
      success: true
      invoiceId: string
      amountDue: number
      hostedInvoiceUrl: string | null
      customerEmail: string
      emailSent: boolean
      stripeAccountId: string
      localInvoiceId: string
    }
  | { success: false; error: string }

export async function getAdminInvoicePrefillAction(input: {
  sourceType: AdminInvoiceSourceType
  sourceId: string
}): Promise<AdminInvoicePrefill | null> {
  const access = await requireInvoiceFinanceAccess()
  if (!access.ok) return null
  return getAdminInvoicePrefill(input.sourceType, input.sourceId)
}

function normalizeDivision(value: string): StripeDivision | null {
  return value === 'provisions' || value === 'digital-studio' ? value : null
}

export async function createAdminInvoice(
  data: CreateAdminInvoiceInput,
): Promise<CreateAdminInvoiceResult> {
  const access = await requireInvoiceFinanceAccess()
  if (!access.ok) return { success: false, error: access.error }

  let finalizedInvoiceId: string | null = null
  let stripeForCleanup: Stripe | null = null

  try {
    const division = normalizeDivision(data.division)
    if (!division) {
      return {
        success: false,
        error:
          'Division is required and must be provisions or digital-studio. Academy and unconfigured divisions are not allowed.',
      }
    }
    if (!isStripeConfigured(division)) {
      return {
        success: false,
        error: `Stripe is not configured for division "${division}". Set the division-specific secret key before creating invoices.`,
      }
    }

    const actor = await getCurrentPrismaUser()
    const actorName = actor?.name || actor?.email || 'Admin'
    const currency = (data.currency || 'usd').toLowerCase()

    if (!ADMIN_INVOICE_CURRENCIES.includes(currency as AdminInvoiceCurrency)) {
      return { success: false, error: 'Invalid currency.' }
    }
    if (!data.clientName?.trim()) {
      return { success: false, error: 'Client name is required.' }
    }
    if (!data.clientEmail?.trim() || !data.clientEmail.includes('@')) {
      return { success: false, error: 'A valid client email is required.' }
    }
    if (!data.dueDate) {
      return { success: false, error: 'Due date is required.' }
    }
    if (!data.lineItems?.length) {
      return { success: false, error: 'Add at least one line item.' }
    }

    const dueAt = new Date(`${data.dueDate}T23:59:59Z`)
    if (Number.isNaN(dueAt.getTime())) {
      return { success: false, error: 'Invalid due date.' }
    }

    const depositDollars =
      typeof data.depositReceived === 'number' && Number.isFinite(data.depositReceived)
        ? data.depositReceived
        : 0
    if (depositDollars < 0) {
      return { success: false, error: 'Deposit cannot be below zero.' }
    }

    for (const item of data.lineItems) {
      if (!item.description?.trim()) {
        return { success: false, error: 'Every line item needs a description.' }
      }
      if (!(item.unitAmount > 0)) {
        return { success: false, error: 'Unit price must be greater than 0.' }
      }
      if (!(item.quantity > 0)) {
        return { success: false, error: 'Quantity must be greater than 0.' }
      }
    }

    const stripe = getStripeClient(division)
    stripeForCleanup = stripe
    const stripeAccountId = await getStripeOwnAccountId(division)

    const existing = await stripe.customers.list({
      email: data.clientEmail.trim(),
      limit: 1,
    })
    const customer =
      existing.data.length > 0
        ? existing.data[0]
        : await stripe.customers.create({
            name: data.clientName.trim(),
            email: data.clientEmail.trim(),
            metadata: {
              division,
              booking_id: data.bookingId?.trim() || '',
              project_id: data.projectId?.trim() || '',
            },
          })

    const pending = await stripe.invoiceItems.list({
      customer: customer.id,
      pending: true,
      limit: 50,
    })
    for (const item of pending.data) {
      await stripe.invoiceItems.del(item.id)
    }

    const depositCents = Math.round(depositDollars * 100)
    const grossCents = data.lineItems.reduce(
      (sum, item) => sum + Math.round(item.unitAmount * item.quantity * 100),
      0,
    )
    if (grossCents <= 0) {
      return { success: false, error: 'Invoice total must be greater than zero.' }
    }
    if (depositCents > grossCents) {
      return { success: false, error: 'Deposit cannot exceed the total invoice amount.' }
    }

    const grossDollars = grossCents / 100
    const lastIndex = data.lineItems.length - 1
    for (let index = 0; index < data.lineItems.length; index++) {
      const item = data.lineItems[index]
      let amountCents = Math.round(item.unitAmount * item.quantity * 100)
      let description = item.description.trim()

      if (index === lastIndex && depositCents > 0) {
        amountCents -= depositCents
        description += ` - Total: $${grossDollars.toFixed(2)}. Deposit of $${depositDollars.toFixed(2)} received${
          data.depositDate ? ` ${data.depositDate}` : ''
        }.`
      }

      if (amountCents <= 0) {
        return {
          success: false,
          error:
            'After applying the deposit, one invoice line would be $0 or less. Increase the final line or reduce the deposit.',
        }
      }

      await stripe.invoiceItems.create({
        customer: customer.id,
        amount: amountCents,
        currency,
        description,
        metadata: {
          division,
          booking_id: data.bookingId?.trim() || '',
          project_id: data.projectId?.trim() || '',
        },
      })
    }

    const invoice = await stripe.invoices.create({
      customer: customer.id,
      collection_method: 'send_invoice',
      due_date: Math.floor(dueAt.getTime() / 1000),
      footer: data.footerNote?.trim() || 'Small batch. No shortcuts.',
      pending_invoice_items_behavior: 'include',
      metadata: {
        division,
        booking_id: data.bookingId?.trim() || '',
        project_id: data.projectId?.trim() || '',
        payment_type: 'balance',
        created_via: 'admin_ui',
        source_type: data.sourceType || '',
        source_id: data.sourceId || '',
      },
    })

    const finalized = await stripe.invoices.finalizeInvoice(invoice.id)
    finalizedInvoiceId = finalized.id
    const expectedDue = grossCents - depositCents
    if (finalized.amount_due !== expectedDue) {
      await voidOrphanStripeInvoice(
        stripe,
        finalized.id,
        `amount_due mismatch (got ${finalized.amount_due}, expected ${expectedDue})`,
      )
      finalizedInvoiceId = null
      return {
        success: false,
        error: `Invoice finalized with unexpected amount ($${(finalized.amount_due / 100).toFixed(2)}). Expected $${(expectedDue / 100).toFixed(2)}. The Stripe invoice was voided.`,
      }
    }

    let hostedUrl = finalized.hosted_invoice_url
    let emailSent = false
    const recipient = data.clientEmail.trim()

    let local
    try {
      local = await db.adminInvoice.create({
        data: {
          division,
          sourceType: data.sourceType,
          sourceId: data.sourceId,
          clientId: data.clientId?.trim() || null,
          bookingId: data.bookingId?.trim() || null,
          projectId: data.projectId?.trim() || null,
          stripeAccountId,
          stripeCustomerId: customer.id,
          stripeInvoiceId: finalized.id,
          invoiceNumber: finalized.number,
          currency,
          subtotalCents: grossCents,
          depositAppliedCents: depositCents,
          amountDueCents: finalized.amount_due,
          dueAt,
          status: 'open',
          hostedInvoiceUrl: hostedUrl,
          createdBy: actor?.id || null,
          metadata: {
            sourceType: data.sourceType || null,
            sourceId: data.sourceId || null,
            actorName,
            recipient,
            clientName: data.clientName.trim(),
            emailStatus: 'pending',
          },
        },
      })
    } catch (persistErr) {
      await voidOrphanStripeInvoice(
        stripe,
        finalized.id,
        persistErr instanceof Error ? persistErr.message : 'local admin_invoices persist failed',
      )
      finalizedInvoiceId = null
      console.error('[createAdminInvoice] local persist failed after finalize:', persistErr)
      return {
        success: false,
        error:
          'Stripe invoice was created but could not be saved locally. The Stripe invoice was voided so it will not orphan. Retry create.',
      }
    }

    // Attach local id for webhook/admin reconciliation (created after finalize).
    await stripe.invoices
      .update(finalized.id, {
        metadata: {
          division,
          booking_id: data.bookingId?.trim() || '',
          project_id: data.projectId?.trim() || '',
          payment_type: 'balance',
          created_via: 'admin_ui',
          source_type: data.sourceType || '',
          source_id: data.sourceId || '',
          admin_invoice_id: local.id,
        },
      })
      .catch((error) => console.error('[createAdminInvoice] metadata update failed:', error))

    await syncAdminInvoiceRecord({
      stripeInvoiceId: finalized.id,
      division,
      actorName,
      status: 'open',
      hostedInvoiceUrl: hostedUrl,
      invoiceNumber: finalized.number,
    })

    try {
      const sent = await stripe.invoices.sendInvoice(finalized.id)
      hostedUrl = sent.hosted_invoice_url
      emailSent = true
      await syncAdminInvoiceRecord({
        stripeInvoiceId: finalized.id,
        division,
        actorName,
        status: 'sent',
        sentAt: new Date(),
        hostedInvoiceUrl: hostedUrl,
        invoiceNumber: sent.number,
      })
      await db.adminInvoice.update({
        where: { id: local.id },
        data: {
          hostedInvoiceUrl: hostedUrl,
          metadata: {
            sourceType: data.sourceType || null,
            sourceId: data.sourceId || null,
            actorName,
            recipient,
            clientName: data.clientName.trim(),
            emailStatus: 'sent',
          },
        },
      })
      await logAdminInvoiceEmail({
        division,
        recipient,
        success: true,
        bookingId: data.bookingId,
        projectId: data.projectId,
        invoiceId: finalized.id,
        actorName,
      })
    } catch (error) {
      const emailError = error instanceof Error ? error.message : 'Failed to send invoice email'
      await db.adminInvoice.update({
        where: { id: local.id },
        data: {
          metadata: {
            sourceType: data.sourceType || null,
            sourceId: data.sourceId || null,
            actorName,
            recipient,
            clientName: data.clientName.trim(),
            emailStatus: 'failed',
            emailFailureReason: emailError,
          },
        },
      })
      await logAdminInvoiceEmail({
        division,
        recipient,
        success: false,
        error: emailError,
        bookingId: data.bookingId,
        projectId: data.projectId,
        invoiceId: finalized.id,
        actorName,
      })
    }

    finalizedInvoiceId = null
    return {
      success: true,
      invoiceId: finalized.id,
      amountDue: finalized.amount_due,
      hostedInvoiceUrl: hostedUrl,
      customerEmail: data.clientEmail.trim(),
      emailSent,
      stripeAccountId,
      localInvoiceId: local.id,
    }
  } catch (err) {
    console.error('[createAdminInvoice]', err)
    if (finalizedInvoiceId && stripeForCleanup) {
      await voidOrphanStripeInvoice(
        stripeForCleanup,
        finalizedInvoiceId,
        err instanceof Error ? err.message : 'createAdminInvoice failed after finalize',
      )
    }
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to create invoice',
    }
  }
}

export async function resendAdminInvoice(localInvoiceId: string): Promise<{ success: boolean; error?: string }> {
  const access = await requireInvoiceFinanceAccess()
  if (!access.ok) return { success: false, error: access.error }

  const actor = await getCurrentPrismaUser()
  const actorName = actor?.name || actor?.email || 'Admin'
  const local = await db.adminInvoice.findUnique({ where: { id: localInvoiceId } })
  if (!local) return { success: false, error: 'Invoice not found.' }

  const division = normalizeDivision(local.division)
  if (!division) return { success: false, error: 'Invalid invoice division.' }
  if (local.status === 'void') return { success: false, error: 'Void invoices cannot be resent.' }
  if (local.status === 'paid') return { success: false, error: 'Paid invoices do not need resend.' }

  try {
    const stripe = getStripeClient(division)
    const sent = await stripe.invoices.sendInvoice(local.stripeInvoiceId)
    await syncAdminInvoiceRecord({
      stripeInvoiceId: local.stripeInvoiceId,
      division,
      actorName,
      status: 'sent',
      sentAt: new Date(),
      hostedInvoiceUrl: sent.hosted_invoice_url,
      invoiceNumber: sent.number,
    })
    const prev =
      local.metadata && typeof local.metadata === 'object'
        ? (local.metadata as Record<string, unknown>)
        : {}
    await db.adminInvoice.update({
      where: { id: local.id },
      data: {
        hostedInvoiceUrl: sent.hosted_invoice_url,
        metadata: {
          ...prev,
          emailStatus: 'sent',
          emailFailureReason: null,
        },
      },
    })
    await logAdminInvoiceEmail({
      division,
      recipient: sent.customer_email || String(prev.recipient || ''),
      success: true,
      bookingId: local.bookingId,
      projectId: local.projectId,
      invoiceId: local.stripeInvoiceId,
      actorName,
    })
    return { success: true }
  } catch (error) {
    const emailError = error instanceof Error ? error.message : 'Failed to resend invoice email'
    const prev =
      local.metadata && typeof local.metadata === 'object'
        ? (local.metadata as Record<string, unknown>)
        : {}
    await db.adminInvoice.update({
      where: { id: local.id },
      data: {
        metadata: {
          ...prev,
          emailStatus: 'failed',
          emailFailureReason: emailError,
        },
      },
    })
    await logAdminInvoiceEmail({
      division,
      recipient: String(prev.recipient || ''),
      success: false,
      error: emailError,
      bookingId: local.bookingId,
      projectId: local.projectId,
      invoiceId: local.stripeInvoiceId,
      actorName,
    })
    return { success: false, error: emailError }
  }
}

export async function voidAdminInvoice(localInvoiceId: string): Promise<{ success: boolean; error?: string }> {
  const access = await requireInvoiceFinanceAccess()
  if (!access.ok) return { success: false, error: access.error }

  const actor = await getCurrentPrismaUser()
  const actorName = actor?.name || actor?.email || 'Admin'
  const local = await db.adminInvoice.findUnique({ where: { id: localInvoiceId } })
  if (!local) return { success: false, error: 'Invoice not found.' }

  const division = normalizeDivision(local.division)
  if (!division) return { success: false, error: 'Invalid invoice division.' }
  if (local.status === 'void') return { success: true }
  if (local.status === 'paid') return { success: false, error: 'Paid invoices cannot be voided.' }

  try {
    const stripe = getStripeClient(division)
    await stripe.invoices.voidInvoice(local.stripeInvoiceId)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to void invoice'
    // Already voided in Stripe — keep local ledger in sync.
    if (!/already.*void|voided/i.test(message)) {
      return { success: false, error: message }
    }
  }

  await syncAdminInvoiceRecord({
    stripeInvoiceId: local.stripeInvoiceId,
    division,
    actorName,
    status: 'void',
  })
  return { success: true }
}
