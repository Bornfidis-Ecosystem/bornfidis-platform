import Link from 'next/link'
import { CulinaryCard, CulinaryPageHeader } from '@/components/culinary-os'
import { requireAdminUser } from '@/lib/requireAdmin'
import { db } from '@/lib/db'
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
  await requireAdminUser()

  const [invoices, emailLogs] = await Promise.all([
    db.adminInvoice.findMany({ orderBy: { createdAt: 'desc' } }),
    db.emailSendLog.findMany({
      where: { entityType: 'admin_invoice' },
      select: { entityId: true, recipient: true, status: true, sentAt: true },
      orderBy: { sentAt: 'desc' },
    }),
  ])

  const failedInvoiceIds = new Set(
    emailLogs.filter((log) => log.status === 'failed').map((log) => log.entityId).filter(Boolean)
  )
  for (const invoice of invoices) {
    const meta =
      invoice.metadata && typeof invoice.metadata === 'object'
        ? (invoice.metadata as Record<string, unknown>)
        : null
    if (meta?.emailStatus === 'failed') failedInvoiceIds.add(invoice.stripeInvoiceId)
  }
  const recipientByInvoiceId = new Map<string, string>()
  for (const invoice of invoices) {
    const meta =
      invoice.metadata && typeof invoice.metadata === 'object'
        ? (invoice.metadata as Record<string, unknown>)
        : null
    if (meta && typeof meta.recipient === 'string' && meta.recipient) {
      recipientByInvoiceId.set(invoice.stripeInvoiceId, meta.recipient)
    }
  }
  for (const log of emailLogs) {
    if (log.entityId && !recipientByInvoiceId.has(log.entityId) && log.recipient) {
      recipientByInvoiceId.set(log.entityId, log.recipient)
    }
  }
  const grouped = invoices.reduce<Record<string, typeof invoices>>((acc, invoice) => {
    acc[invoice.division] ||= []
    acc[invoice.division].push(invoice)
    return acc
  }, {})

  return (
    <div className="space-y-6">
      <CulinaryPageHeader
        title="Invoices"
        description="Track local admin invoice records, Stripe IDs, delivery status, and recovery actions."
      />

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
              {division === 'digital-studio' ? 'Digital Studio' : 'Provisions'}
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-culinary-outline">
              <thead className="bg-culinary-surface-high">
                <tr className="font-culinary-sans text-left text-xs uppercase tracking-wider text-culinary-text-muted">
                  <th className="px-4 py-3">Invoice ID (Stripe)</th>
                  <th className="px-4 py-3">Client Email</th>
                  <th className="px-4 py-3">Division</th>
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
                    invoice.status,
                    failedInvoiceIds.has(invoice.stripeInvoiceId)
                  )
                  return (
                    <tr key={invoice.id} className="align-top">
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/invoices/${invoice.id}`}
                          className="font-mono text-xs text-culinary-navy hover:underline"
                        >
                          {invoice.stripeInvoiceId}
                        </Link>
                      </td>
                      <td className="px-4 py-3 font-culinary-sans text-sm text-culinary-ink">
                        {(invoice.metadata &&
                          typeof invoice.metadata === 'object' &&
                          'recipient' in invoice.metadata &&
                          String((invoice.metadata as Record<string, unknown>).recipient)) ||
                          recipientByInvoiceId.get(invoice.stripeInvoiceId) ||
                          '—'}
                      </td>
                      <td className="px-4 py-3 font-culinary-sans text-sm text-culinary-ink">{invoice.division}</td>
                      <td className="px-4 py-3 font-culinary-sans text-sm text-culinary-ink">
                        {formatCurrency(invoice.amountDueCents, invoice.currency)}
                      </td>
                      <td className="px-4 py-3 font-culinary-sans text-sm text-culinary-ink">
                        {invoice.dueAt ? invoice.dueAt.toLocaleDateString('en-US') : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-none border px-2 py-1 text-xs font-semibold ${badgeClasses(displayStatus)}`}>
                          {displayStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-culinary-sans text-sm text-culinary-ink">
                        {invoice.createdAt.toLocaleString('en-US')}
                      </td>
                      <td className="px-4 py-3">
                        <InvoiceActionButtons id={invoice.id} status={invoice.status} />
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
