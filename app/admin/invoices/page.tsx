import Link from 'next/link'
import { CulinaryCard, CulinaryPageHeader } from '@/components/culinary-os'
import { requireFinancialPageAccess } from '@/lib/admin-rbac'
import { db } from '@/lib/db'
import { stripeDivisionLabel, stripeDivisionShortHint } from '@/lib/stripe-division-labels'
import { InvoiceActionButtons } from './InvoiceActionButtons'

export const dynamic = 'force-dynamic'

function formatCurrency(cents: number, currency: string) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: (currency || 'usd').toUpperCase(),
  }).format(cents / 100)
}

function getDisplayStatus(status: string, emailFailed: boolean) {
  if (emailFailed && status !== 'paid' && status !== 'void') return 'email_failed'
  return status
}

function badgeClasses(status: string) {
  switch (status) {
    case 'paid':
      return 'bg-green-100 text-green-800 border-green-200'
    case 'open':
    case 'sent':
    case 'overdue':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'void':
      return 'bg-gray-100 text-gray-700 border-gray-200'
    case 'email_failed':
    case 'payment_failed':
      return 'bg-red-100 text-red-800 border-red-200'
    default:
      return 'bg-white text-culinary-ink border-culinary-outline'
  }
}

export default async function AdminInvoicesPage() {
  await requireFinancialPageAccess()

  let invoices: Awaited<ReturnType<typeof db.adminInvoice.findMany>> = []
  let emailLogs: Array<{
    entityId: string | null
    recipient: string
    status: string
    sentAt: Date
  }> = []
  let emailLogUnavailable = false

  try {
    invoices = await db.adminInvoice.findMany({ orderBy: { createdAt: 'desc' } })
  } catch (error) {
    console.error('[admin/invoices] adminInvoice.findMany failed:', error)
    throw error
  }

  try {
    emailLogs = await db.emailSendLog.findMany({
      where: { entityType: 'admin_invoice' },
      select: { entityId: true, recipient: true, status: true, sentAt: true },
      orderBy: { sentAt: 'desc' },
    })
  } catch (error) {
    // Preview/prod may lack email_send_log even when admin_invoices exists.
    emailLogUnavailable = true
    console.error('[admin/invoices] emailSendLog query failed; continuing without email logs:', error)
  }

  const failedInvoiceIds = new Set<string>()
  for (const log of emailLogs) {
    if (log.status === 'failed' && log.entityId) failedInvoiceIds.add(log.entityId)
  }
  for (const invoice of invoices) {
    const meta =
      invoice.metadata && typeof invoice.metadata === 'object' && !Array.isArray(invoice.metadata)
        ? (invoice.metadata as Record<string, unknown>)
        : null
    if (meta?.emailStatus === 'failed' && invoice.stripeInvoiceId) {
      failedInvoiceIds.add(invoice.stripeInvoiceId)
    }
  }

  const recipientByInvoiceId = new Map<string, string>()
  for (const invoice of invoices) {
    const meta =
      invoice.metadata && typeof invoice.metadata === 'object' && !Array.isArray(invoice.metadata)
        ? (invoice.metadata as Record<string, unknown>)
        : null
    if (meta && typeof meta.recipient === 'string' && meta.recipient && invoice.stripeInvoiceId) {
      recipientByInvoiceId.set(invoice.stripeInvoiceId, meta.recipient)
    }
  }
  for (const log of emailLogs) {
    if (log.entityId && !recipientByInvoiceId.has(log.entityId) && log.recipient) {
      recipientByInvoiceId.set(log.entityId, log.recipient)
    }
  }

  const grouped = invoices.reduce<Record<string, typeof invoices>>((acc, invoice) => {
    const key = invoice.division?.trim() || 'unknown'
    acc[key] ||= []
    acc[key].push(invoice)
    return acc
  }, {})

  return (
    <div className="space-y-6">
      <CulinaryPageHeader
        title="Invoices"
        description="Track local admin invoice records by Stripe account (Provisions vs Digital Studio), delivery status, and recovery actions."
      />

      <CulinaryCard>
        <p className="font-culinary-sans text-sm text-culinary-ink">
          Invoices are created on a specific Stripe account. Provisions and Digital Studio balances
          are not interchangeable.
        </p>
        <p className="mt-1 font-culinary-sans text-xs text-culinary-text-muted">
          Sportswear is not part of this invoice ledger. {stripeDivisionShortHint('sportswear')}.
        </p>
      </CulinaryCard>
      {emailLogUnavailable ? (
        <CulinaryCard>
          <p className="font-culinary-sans text-sm text-amber-800">
            Email delivery history is temporarily unavailable (email log table missing or unreachable).
            Invoice records below are still shown from the local ledger.
          </p>
        </CulinaryCard>
      ) : null}

      <div className="flex justify-end">
        <Link
          href="/admin/invoices/new"
          className="rounded-none bg-culinary-forest px-4 py-2 font-culinary-sans text-sm font-semibold text-white"
        >
          New Invoice
        </Link>
      </div>

      {Object.entries(grouped).map(([division, rows]) => (
        <CulinaryCard key={division} padded={false} className="overflow-hidden">
          <div className="border-b border-culinary-outline px-4 py-3">
            <h2 className="font-culinary-display text-title-md text-culinary-navy">
              {stripeDivisionLabel(division)} Stripe account
            </h2>
            <p className="mt-0.5 font-culinary-sans text-xs text-culinary-text-muted">
              {stripeDivisionShortHint(division)}
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-culinary-outline">
              <thead className="bg-culinary-surface-high">
                <tr className="font-culinary-sans text-left text-xs uppercase tracking-wider text-culinary-text-muted">
                  <th className="px-4 py-3">Invoice ID (Stripe)</th>
                  <th className="px-4 py-3">Client Email</th>
                  <th className="px-4 py-3">Stripe account</th>
                  <th className="px-4 py-3">Amount Due</th>
                  <th className="px-4 py-3">Due Date</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Created At</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-culinary-outline bg-white">
                {rows.map((invoice) => {
                  const displayStatus = getDisplayStatus(
                    invoice.status || 'unknown',
                    Boolean(invoice.stripeInvoiceId && failedInvoiceIds.has(invoice.stripeInvoiceId)),
                  )
                  let amountLabel = '—'
                  try {
                    amountLabel = formatCurrency(invoice.amountDueCents ?? 0, invoice.currency || 'usd')
                  } catch (error) {
                    console.error('[admin/invoices] invalid currency/amount on', invoice.id, error)
                    amountLabel = `${((invoice.amountDueCents ?? 0) / 100).toFixed(2)} ${invoice.currency || ''}`.trim()
                  }
                  let createdLabel = '—'
                  try {
                    createdLabel = invoice.createdAt
                      ? invoice.createdAt.toLocaleString('en-US')
                      : '—'
                  } catch (error) {
                    console.error('[admin/invoices] invalid createdAt on', invoice.id, error)
                  }
                  let dueLabel = '—'
                  try {
                    dueLabel = invoice.dueAt ? invoice.dueAt.toLocaleDateString('en-US') : '—'
                  } catch (error) {
                    console.error('[admin/invoices] invalid dueAt on', invoice.id, error)
                  }

                  return (
                    <tr key={invoice.id} className="align-top">
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/invoices/${invoice.id}`}
                          className="font-mono text-xs text-culinary-navy hover:underline"
                        >
                          {invoice.stripeInvoiceId || invoice.id}
                        </Link>
                      </td>
                      <td className="px-4 py-3 font-culinary-sans text-sm text-culinary-ink">
                        {(invoice.metadata &&
                          typeof invoice.metadata === 'object' &&
                          !Array.isArray(invoice.metadata) &&
                          'recipient' in invoice.metadata &&
                          String((invoice.metadata as Record<string, unknown>).recipient || '')) ||
                          (invoice.stripeInvoiceId
                            ? recipientByInvoiceId.get(invoice.stripeInvoiceId)
                            : undefined) ||
                          '—'}
                      </td>
                      <td className="px-4 py-3 font-culinary-sans text-sm text-culinary-ink">
                        <span title={invoice.stripeAccountId || undefined}>
                          {stripeDivisionLabel(invoice.division)}
                        </span>
                        {invoice.stripeAccountId ? (
                          <span className="mt-0.5 block font-mono text-[10px] text-culinary-text-muted">
                            {invoice.stripeAccountId}
                          </span>
                        ) : null}
                      </td>
                      <td className="px-4 py-3 font-culinary-sans text-sm text-culinary-ink">
                        {amountLabel}
                      </td>
                      <td className="px-4 py-3 font-culinary-sans text-sm text-culinary-ink">
                        {dueLabel}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-none border px-2 py-1 text-xs font-semibold ${badgeClasses(displayStatus)}`}
                        >
                          {displayStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-culinary-sans text-sm text-culinary-ink">
                        {createdLabel}
                      </td>
                      <td className="px-4 py-3">
                        <InvoiceActionButtons id={invoice.id} status={invoice.status || 'open'} />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CulinaryCard>
      ))}

      {invoices.length === 0 ? (
        <CulinaryCard>
          <p className="font-culinary-sans text-sm text-culinary-text-muted">No invoices yet.</p>
        </CulinaryCard>
      ) : null}
    </div>
  )
}
