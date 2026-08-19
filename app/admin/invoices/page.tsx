import Link from 'next/link'
import { CulinaryCard, CulinaryPageHeader } from '@/components/culinary-os'
import { requireFinancialPageAccess } from '@/lib/admin-rbac'
import {
  diagnoseAdminInvoiceStripeAccess,
  getConfiguredStripeKeyMode,
} from '@/lib/admin-invoices'
import { db } from '@/lib/db'
import { InvoiceActionButtons } from './InvoiceActionButtons'
import { InvoiceSyncFromStripeButton } from './InvoiceSyncFromStripeButton'

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

function classifyEmailLogError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error)
  if (/email_send_log|does not exist|P2021|relation/i.test(message)) {
    return 'The email_send_log table is missing. Apply migration 20260731200000_add_email_send_log on this database.'
  }
  if (/P1001|can't reach|ECONNREFUSED|timeout/i.test(message)) {
    return 'Database unreachable while reading email_send_log. Check DATABASE_URL / pooler connectivity.'
  }
  return 'Email delivery history is temporarily unavailable. Invoice records below are still shown from the local ledger.'
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
  let emailLogErrorDetail: string | null = null

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
    emailLogUnavailable = true
    emailLogErrorDetail = classifyEmailLogError(error)
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

  const provisionsMode = getConfiguredStripeKeyMode('provisions')
  const digitalStudioMode = getConfiguredStripeKeyMode('digital-studio')

  const provisionsIds = invoices
    .filter((i) => i.division === 'provisions')
    .map((i) => i.stripeInvoiceId)
  const digitalStudioIds = invoices
    .filter((i) => i.division === 'digital-studio')
    .map((i) => i.stripeInvoiceId)

  const [provisionsDiag, digitalStudioDiag] = await Promise.all([
    provisionsIds.length
      ? diagnoseAdminInvoiceStripeAccess('provisions', provisionsIds)
      : Promise.resolve(null),
    digitalStudioIds.length
      ? diagnoseAdminInvoiceStripeAccess('digital-studio', digitalStudioIds)
      : Promise.resolve(null),
  ])

  return (
    <div className="space-y-6">
      <CulinaryPageHeader
        title="Invoices"
        description="Track local admin invoice records, Stripe IDs, delivery status, and recovery actions."
      />

      <CulinaryCard>
        <p className="font-culinary-sans text-sm text-culinary-ink">
          Configured Stripe key mode — Provisions: <strong>{provisionsMode}</strong>
          {' · '}
          Digital Studio: <strong>{digitalStudioMode}</strong>
        </p>
        <p className="mt-1 font-culinary-sans text-xs text-culinary-text-muted">
          The ledger only syncs with invoices in the same Stripe mode as these keys. Live invoices will
          not appear when the app is using test keys (and the reverse).
        </p>
        <div className="mt-3 flex flex-wrap gap-3">
          <InvoiceSyncFromStripeButton division="provisions" mode={provisionsMode} />
          <InvoiceSyncFromStripeButton division="digital-studio" mode={digitalStudioMode} />
        </div>
      </CulinaryCard>

      {provisionsDiag && provisionsDiag.modeMismatch > 0 ? (
        <CulinaryCard>
          <p className="font-culinary-sans text-sm text-amber-900">
            Provisions ledger has {provisionsDiag.modeMismatch} sample invoice
            {provisionsDiag.modeMismatch === 1 ? '' : 's'} that exist in the other Stripe mode (not
            reachable with the current <strong>{provisionsDiag.mode}</strong> key). Those rows will
            look “out of sync” until you use matching keys or recreate invoices in this mode.
          </p>
        </CulinaryCard>
      ) : null}

      {digitalStudioDiag && digitalStudioDiag.modeMismatch > 0 ? (
        <CulinaryCard>
          <p className="font-culinary-sans text-sm text-amber-900">
            Digital Studio ledger has mode-mismatched Stripe invoice IDs under the current{' '}
            <strong>{digitalStudioDiag.mode}</strong> key.
          </p>
        </CulinaryCard>
      ) : null}

      {emailLogUnavailable ? (
        <CulinaryCard>
          <p className="font-culinary-sans text-sm text-amber-800">
            {emailLogErrorDetail ||
              'Email delivery history is temporarily unavailable (email log table missing or unreachable).'}
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
              {division === 'digital-studio'
                ? 'Digital Studio'
                : division === 'provisions'
                  ? 'Provisions'
                  : division}
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
                        {invoice.division || '—'}
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
