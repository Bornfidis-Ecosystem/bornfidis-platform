import { getPartnerProfileForCurrentUser } from '@/lib/partner'
import { getCurrentUserRole } from '@/lib/get-user-role'
import { getCurrentPrismaUser } from '@/lib/partner'
import { requireRole } from '@/lib/require-role'
import { CHEF_ROLES } from '@/lib/require-role'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { db } from '@/lib/db'
import { SUPPORTED_CURRENCIES } from '@/lib/currency'
import ChefPreferredCurrencyForm from './ChefPreferredCurrencyForm'

export const dynamic = 'force-dynamic'

/**
 * Phase 2H — Chef profile (kitchen & availability).
 * Phase 2AI — Preferred payout currency.
 */
export default async function ChefProfilePage() {
  const role = await getCurrentUserRole()
  if (!role) redirect('/admin/login')
  requireRole(role, CHEF_ROLES)

  const profile = await getPartnerProfileForCurrentUser()
  if (!profile?.completed) redirect('/partner/setup')

  const user = await getCurrentPrismaUser()
  const chefProfile = user?.id
    ? await db.chefProfile.findUnique({
        where: { userId: user.id },
        select: { preferredPayoutCurrency: true, payoutCurrencyOverride: true },
      })
    : null
  const preferred = chefProfile?.preferredPayoutCurrency ?? 'USD'
  const override = chefProfile?.payoutCurrencyOverride

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-xl font-semibold text-gray-900">My Profile</h1>
      <p className="text-sm text-gray-500">
        Kitchen and availability settings will be available here.
      </p>
      <div className="rounded-lg border border-gray-200 bg-white p-4 space-y-2">
        <p><span className="font-medium text-gray-700">Name:</span> {profile.displayName}</p>
        <p><span className="font-medium text-gray-700">Parish:</span> {profile.parish || 'Not set'}</p>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-gray-900 mb-2">Notifications (Phase 2AK)</h2>
        <NotificationsToggle />
      </div>
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-gray-900 mb-2">SMS fallback (Phase 2AM)</h2>
        <p className="text-xs text-gray-500 mb-2">
          Critical alerts (new booking, prep reminder, changes) can be sent by SMS if we have your phone. You can turn this off anytime.
        </p>
        <SmsFallbackToggle initialEnabled={(user as { smsEnabled?: boolean } | null)?.smsEnabled ?? true} />
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-gray-900 mb-2">Payout currency (Phase 2AI)</h2>
        <p className="text-xs text-gray-500 mb-3">
          Your payouts are calculated in USD. You can choose to see amounts converted to another currency; the rate is locked when each payout is created.
        </p>
        {override ? (
          <p className="text-sm text-amber-700">
            Admin has set your payout currency to <strong>{override}</strong>. Contact admin to change.
          </p>
        ) : (
          <ChefPreferredCurrencyForm
            currentCurrency={preferred}
            currencies={SUPPORTED_CURRENCIES}
          />
        )}
      </div>

      <Link href="/chef" className="text-sm text-green-700 hover:underline">← Back to dashboard</Link>
    </div>
  )
}
