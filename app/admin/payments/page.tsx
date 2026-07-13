import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getCurrentUserRole } from '@/lib/get-user-role'
import { canViewAdmin } from '@/lib/authz'
import { listStripeWebhookLogs } from '@/lib/stripe-webhook-log'
import { formatUSD } from '@/lib/money'
import { stripePaymentDashboardUrl } from '@/lib/stripe-reconciliation'
import { CulinaryCard, CulinaryPageHeader } from '@/components/culinary-os'
import LinkStripeLogToBooking from '@/components/admin/LinkStripeLogToBooking'

export const dynamic = 'force-dynamic'

type Search = { status?: string }

export default async function PaymentsReconciliationPage({
  searchParams,
}: {
  searchParams: Promise<Search>
}) {
  const userRole = await getCurrentUserRole()
  if (!canViewAdmin(userRole)) {
    redirect('/admin')
  }

  const sp = await searchParams
  const status = sp.status === 'all' ? undefined : sp.status || 'unmatched'
  const rows = await listStripeWebhookLogs({ status, limit: 150 })

  return (
    <div className="min-h-screen bg-culinary-bone">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <CulinaryPageHeader
          title="Payments / Reconciliation"
          description="Stripe webhook audit trail — unmatched payments need a booking link."
        />

        <div className="mb-6 flex flex-wrap gap-2 font-culinary-sans text-label-caps">
          {(
            [
              ['unmatched', 'Unmatched'],
              ['matched', 'Matched'],
              ['error', 'Errors'],
              ['all', 'All'],
            ] as const
          ).map(([key, label]) => {
            const current = sp.status || 'unmatched'
            const isActive = key === 'all' ? sp.status === 'all' : current === key && sp.status !== 'all'
            const href = key === 'all' ? '/admin/payments?status=all' : `/admin/payments?status=${key}`
            return (
              <Link
                key={key}
                href={href}
                className={`rounded-none border px-3 py-1.5 ${
                  isActive || (!sp.status && key === 'unmatched')
                    ? 'border-culinary-navy bg-culinary-navy text-culinary-on-navy'
                    : 'border-culinary-outline bg-culinary-bone text-culinary-navy'
                }`}
              >
                {label}
              </Link>
            )
          })}
        </div>

        <CulinaryCard>
          {rows.length === 0 ? (
            <p className="font-culinary-sans text-body-md text-culinary-text-muted">
              No webhook log rows for this filter. Deploy the migration and ensure the live Stripe webhook
              points at <code className="text-xs">/api/stripe/webhook</code> with{' '}
              <code className="text-xs">checkout.session.completed</code> and{' '}
              <code className="text-xs">payment_intent.succeeded</code>.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] border-collapse text-left font-culinary-sans text-body-md">
                <thead>
                  <tr className="border-b border-culinary-outline text-label-caps text-culinary-text-muted">
                    <th className="px-2 py-3 font-medium">Date</th>
                    <th className="px-2 py-3 font-medium">Amount</th>
                    <th className="px-2 py-3 font-medium">Email</th>
                    <th className="px-2 py-3 font-medium">Booking</th>
                    <th className="px-2 py-3 font-medium">Status</th>
                    <th className="px-2 py-3 font-medium">Stripe</th>
                    <th className="px-2 py-3 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => {
                    const pi = row.paymentIntentId
                    return (
                      <tr key={row.id} className="border-b border-culinary-outline/70 align-top">
                        <td className="px-2 py-3 tabular-nums text-culinary-text-muted">
                          {row.receivedAt.toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className="px-2 py-3 font-medium text-culinary-ink">
                          {row.amountCents != null ? formatUSD(row.amountCents) : '—'}
                        </td>
                        <td className="px-2 py-3 text-culinary-ink">{row.customerEmail || '—'}</td>
                        <td className="px-2 py-3">
                          {row.matchedBooking ? (
                            <Link
                              href={`/admin/bookings/${row.matchedBooking.id}`}
                              className="text-culinary-navy underline"
                            >
                              {row.matchedBooking.name}
                            </Link>
                          ) : (
                            <span className="text-culinary-text-muted">—</span>
                          )}
                        </td>
                        <td className="px-2 py-3">
                          <span
                            className={`inline-block rounded-none border px-2 py-0.5 text-label-caps ${
                              row.processingStatus === 'matched'
                                ? 'border-emerald-700/30 bg-emerald-50 text-emerald-900'
                                : row.processingStatus === 'unmatched'
                                  ? 'border-amber-600/40 bg-amber-50 text-amber-950'
                                  : row.processingStatus === 'error'
                                    ? 'border-red-600/40 bg-red-50 text-red-900'
                                    : 'border-culinary-outline text-culinary-text-muted'
                            }`}
                          >
                            {row.processingStatus}
                          </span>
                          {row.errorMessage && (
                            <p className="mt-1 max-w-[14rem] text-xs text-culinary-text-muted">
                              {row.errorMessage}
                            </p>
                          )}
                        </td>
                        <td className="px-2 py-3">
                          {pi ? (
                            <a
                              href={stripePaymentDashboardUrl(pi)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-mono text-[11px] text-culinary-navy underline"
                            >
                              {pi.slice(0, 18)}…
                            </a>
                          ) : (
                            <span className="font-mono text-[11px] text-culinary-text-muted">
                              {row.stripeObjectId.slice(0, 18)}…
                            </span>
                          )}
                        </td>
                        <td className="px-2 py-3">
                          {row.processingStatus === 'unmatched' && pi ? (
                            <LinkStripeLogToBooking
                              webhookLogId={row.id}
                              paymentIntentId={pi}
                              amountCents={row.amountCents}
                              customerEmail={row.customerEmail}
                            />
                          ) : (
                            '—'
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CulinaryCard>
      </div>
    </div>
  )
}
