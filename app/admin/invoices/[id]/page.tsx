import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CulinaryCard, CulinaryPageHeader } from '@/components/culinary-os'
import { requireAdminUser } from '@/lib/requireAdmin'
import { db } from '@/lib/db'
import { CopyTextButton } from '../CopyTextButton'
import { InvoiceActionButtons } from '../InvoiceActionButtons'

export const dynamic = 'force-dynamic'

function formatValue(value: unknown) {
  if (value == null || value === '') return '—'
  if (value instanceof Date) return value.toLocaleString('en-US')
  if (typeof value === 'object') return JSON.stringify(value, null, 2)
  return String(value)
}

export default async function AdminInvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await requireAdminUser()
  const { id } = await params

  const invoice = await db.adminInvoice.findUnique({ where: { id } })
  if (!invoice) notFound()

  let emailLogs: Awaited<ReturnType<typeof db.emailSendLog.findMany>> = []
  let emailLogUnavailable = false
  try {
    emailLogs = await db.emailSendLog.findMany({
      where: {
        entityType: 'admin_invoice',
        entityId: invoice.stripeInvoiceId,
      },
      orderBy: { sentAt: 'desc' },
    })
  } catch (error) {
    emailLogUnavailable = true
    console.error('[admin/invoices/[id]] emailSendLog query failed:', error)
  }

  const meta =
    invoice.metadata && typeof invoice.metadata === 'object' && !Array.isArray(invoice.metadata)
      ? (invoice.metadata as Record<string, unknown>)
      : {}
  const emailStatus = typeof meta.emailStatus === 'string' ? meta.emailStatus : null
  const emailFailureReason =
    typeof meta.emailFailureReason === 'string' ? meta.emailFailureReason : null
  const clientName = typeof meta.clientName === 'string' ? meta.clientName : null
  const recipient = typeof meta.recipient === 'string' ? meta.recipient : null

  const fields: Array<[string, unknown]> = [
    ['ID', invoice.id],
    ['Division', invoice.division],
    ['Customer name', clientName],
    ['Customer email', recipient],
    ['Source Type', invoice.sourceType],
    ['Source ID', invoice.sourceId],
    ['Client ID', invoice.clientId],
    ['Booking ID', invoice.bookingId],
    ['Project ID', invoice.projectId],
    ['Stripe Account ID', invoice.stripeAccountId],
    ['Stripe Customer ID', invoice.stripeCustomerId],
    ['Stripe Invoice ID', invoice.stripeInvoiceId],
    ['Invoice Number', invoice.invoiceNumber],
    ['Currency', invoice.currency],
    ['Subtotal (cents)', invoice.subtotalCents],
    ['Deposit Applied (cents)', invoice.depositAppliedCents],
    ['Amount Due (cents)', invoice.amountDueCents],
    ['Due At', invoice.dueAt],
    ['Status', invoice.status],
    ['Email status', emailStatus],
    ['Email failure reason', emailFailureReason],
    ['Hosted Invoice URL', invoice.hostedInvoiceUrl],
    ['Created By', invoice.createdBy],
    ['Created At', invoice.createdAt],
    ['Sent At', invoice.sentAt],
    ['Paid At', invoice.paidAt],
    ['Metadata', invoice.metadata],
  ]

  return (
    <div className="space-y-6">
      <CulinaryPageHeader
        title="Invoice Detail"
        description="Review the local invoice ledger row, related email attempts, and Stripe routing used."
      />

      <div className="flex justify-between gap-4">
        <Link href="/admin/invoices" className="font-culinary-sans text-sm text-culinary-navy hover:underline">
          ← Back to invoices
        </Link>
        <InvoiceActionButtons id={invoice.id} status={invoice.status} />
      </div>

      <CulinaryCard>
        <div className="space-y-4">
          {emailStatus === 'failed' ? (
            <div className="border border-red-300 bg-red-50 px-3 py-2">
              <p className="font-culinary-sans text-sm font-semibold text-red-800">
                Invoice exists — email delivery failed
              </p>
              <p className="mt-1 font-culinary-sans text-sm text-red-800">
                {emailFailureReason || 'Share the hosted invoice URL manually, then use Resend Email.'}
              </p>
            </div>
          ) : null}

          {invoice.hostedInvoiceUrl ? (
            <div className="space-y-2">
              <p className="font-culinary-sans text-xs font-bold uppercase tracking-wider text-culinary-text-muted">
                Hosted Invoice URL
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <a
                  href={invoice.hostedInvoiceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="break-all font-mono text-xs text-culinary-navy hover:underline"
                >
                  {invoice.hostedInvoiceUrl}
                </a>
                <CopyTextButton value={invoice.hostedInvoiceUrl} />
              </div>
            </div>
          ) : null}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {fields.map(([label, value]) => (
              <div key={label}>
                <p className="font-culinary-sans text-xs font-bold uppercase tracking-wider text-culinary-text-muted">
                  {label}
                </p>
                <pre className="mt-1 whitespace-pre-wrap break-words font-culinary-sans text-sm text-culinary-ink">
                  {formatValue(value)}
                </pre>
              </div>
            ))}
          </div>
        </div>
      </CulinaryCard>

      <CulinaryCard padded={false} className="overflow-hidden">
        <div className="border-b border-culinary-outline px-4 py-3">
          <h2 className="font-culinary-display text-title-md text-culinary-navy">Email Log Entries</h2>
        </div>
        {emailLogUnavailable ? (
          <div className="px-4 py-4 font-culinary-sans text-sm text-amber-800">
            Email delivery history is unavailable (email log table missing or unreachable).
          </div>
        ) : emailLogs.length === 0 ? (
          <div className="px-4 py-4 font-culinary-sans text-sm text-culinary-text-muted">
            No email log entries for this invoice.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-culinary-outline">
              <thead className="bg-culinary-surface-high">
                <tr className="font-culinary-sans text-left text-xs uppercase tracking-wider text-culinary-text-muted">
                  <th className="px-4 py-3">Sent At</th>
                  <th className="px-4 py-3">Recipient</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Attempt</th>
                  <th className="px-4 py-3">Error</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-culinary-outline bg-white">
                {emailLogs.map((log) => (
                  <tr key={log.id}>
                    <td className="px-4 py-3 font-culinary-sans text-sm text-culinary-ink">
                      {log.sentAt.toLocaleString('en-US')}
                    </td>
                    <td className="px-4 py-3 font-culinary-sans text-sm text-culinary-ink">{log.recipient}</td>
                    <td className="px-4 py-3 font-culinary-sans text-sm text-culinary-ink">{log.status}</td>
                    <td className="px-4 py-3 font-culinary-sans text-sm text-culinary-ink">{log.attemptCount}</td>
                    <td className="px-4 py-3 font-culinary-sans text-sm text-culinary-ink">{log.errorMessage || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CulinaryCard>
    </div>
  )
}
