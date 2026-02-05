import { getPartnerProfileForCurrentUser } from '@/lib/partner'
import { getCurrentUserRole } from '@/lib/get-user-role'
import { getCurrentPrismaUser } from '@/lib/partner'
import { requireRole } from '@/lib/require-role'
import { CHEF_ROLES } from '@/lib/require-role'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { db } from '@/lib/db'
import { hasRequiredModulesComplete } from '@/lib/education'
import { UserRole } from '@prisma/client'
import { convertUsdCentsToDisplay, formatCurrency } from '@/lib/currency'

export const dynamic = 'force-dynamic'

/**
 * Phase 2J — Chef Payouts View (read-only).
 * Phase 2M — Optional gate: required education modules must be complete (banner if not).
 */
export default async function ChefPayoutsPage() {
  const role = await getCurrentUserRole()
  if (!role) redirect('/admin/login')
  requireRole(role, CHEF_ROLES)

  const profile = await getPartnerProfileForCurrentUser()
  if (!profile?.completed) redirect('/partner/setup')

  const user = await getCurrentPrismaUser()
  if (!user?.id) redirect('/admin/login')

  const isChefOnly = String(role).toUpperCase() === 'CHEF'
  const requiredEducationComplete =
    !isChefOnly || (await hasRequiredModulesComplete(user.id, UserRole.CHEF))

  const assignments = await db.chefAssignment.findMany({
    where: isChefOnly ? { chefId: user.id } : undefined,
    orderBy: { createdAt: 'desc' },
    include: {
      booking: {
        select: {
          id: true,
          name: true,
          eventDate: true,
          chefPayoutAmountCents: true,
          chefPayoutBaseCents: true,
          chefPayoutBonusCents: true,
          chefPayoutStatus: true,
          chefPayoutPaidAt: true,
          chefPayoutCurrency: true,
          chefPayoutFxRate: true,
        },
      },
    },
  })

  const rows = assignments
    .filter((a) => a.booking.chefPayoutAmountCents != null || a.booking.chefPayoutStatus != null)
    .map((a) => {
      const amt = a.booking.chefPayoutAmountCents ?? 0
      const currency = a.booking.chefPayoutCurrency ?? 'USD'
      const fxRate = a.booking.chefPayoutFxRate
      const usdAmount = amt / 100
      const convertedAmount = currency !== 'USD' && fxRate != null ? usdAmount * fxRate : usdAmount
      return {
        id: a.id,
        bookingId: a.booking.id,
        date: a.booking.eventDate,
        serviceName: a.booking.name,
        amountCents: amt,
        status: a.booking.chefPayoutStatus ?? 'not_applicable',
        paidAt: a.booking.chefPayoutPaidAt,
        currency,
        fxRate: fxRate ?? null,
        convertedAmount,
      }
    })

  function statusLabel(status: string | null) {
    if (!status) return '—'
    const s = status.toLowerCase()
    if (s === 'paid') return 'Paid'
    if (s === 'pending') return 'Pending'
    if (s === 'on_hold' || s === 'on hold') return 'On hold'
    if (s === 'not_applicable') return 'Not yet set'
    return status
  }

  const totalCents = rows.reduce((s, p) => s + p.amountCents, 0)

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
      <h1 className="text-xl font-semibold text-gray-900">Payouts</h1>
      <p className="text-sm text-gray-500">
        Earnings by booking. Status is updated by admin. No editing.
      </p>

      {rows.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Total (base currency)</p>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalCents / 100, 'USD')}</p>
          <p className="text-xs text-gray-500 mt-1">All amounts calculated in USD. Converted amounts shown per payout when rate was locked.</p>
        </div>
      )}

      {!requiredEducationComplete && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <strong>Complete required education first.</strong> Finish all required modules in{' '}
          <Link href="/chef/education" className="font-medium underline">
            Chef → Education
          </Link>{' '}
          before payouts can be released.
        </div>
      )}

      {rows.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-gray-500">
          No payout records yet. When admin assigns you to a booking and sets payout amounts, they will appear here.
        </div>
      ) : (
        <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Date</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Booking</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700">Amount</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Status</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Paid</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {rows.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-900">
                    {new Date(p.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="px-4 py-3 text-gray-900">{p.serviceName}</td>
                  <td className="px-4 py-3 text-right font-medium text-gray-900">
                    {formatCurrency(p.amountCents / 100, 'USD')}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-600">
                    {p.currency !== 'USD' && p.fxRate != null ? (
                      <span title={`Rate locked at payout: 1 USD = ${p.fxRate} ${p.currency}`}>
                        {formatCurrency(p.convertedAmount, p.currency)}
                        <span className="block text-xs text-gray-400">Rate locked at payout</span>
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded px-2 py-1 text-xs font-medium ${
                        p.status?.toLowerCase() === 'paid'
                          ? 'bg-green-100 text-green-800'
                          : p.status?.toLowerCase() === 'pending'
                            ? 'bg-amber-100 text-amber-800'
                            : p.status?.toLowerCase() === 'on_hold'
                              ? 'bg-orange-100 text-orange-800'
                              : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {statusLabel(p.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {p.paidAt
                      ? new Date(p.paidAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })
                      : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-xs text-gray-500">
        Payout timing and release are managed in Admin → Payouts. Contact admin if you have questions.
      </p>

      <Link href="/chef" className="text-sm text-green-700 hover:underline">
        ← Back to dashboard
      </Link>
    </div>
  )
}
