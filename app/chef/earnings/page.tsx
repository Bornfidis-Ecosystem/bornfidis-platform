import Link from 'next/link'
import { getCurrentPrismaUser } from '@/lib/partner'
import { getCurrentUserRole } from '@/lib/get-user-role'
import { requireRole } from '@/lib/require-role'
import { CHEF_ROLES } from '@/lib/require-role'
import { redirect } from 'next/navigation'
import { getEarningsProjections } from '@/lib/chef-earnings-projections'
import { formatMoney } from '@/lib/money'

export const dynamic = 'force-dynamic'

/**
 * Phase 2AC — Chef earnings projections.
 * Confirmed = exact. Estimated = range from open availability. Access: CHEF (admin can disable via env).
 */
export default async function ChefEarningsPage() {
  const role = await getCurrentUserRole()
  if (!role) redirect('/admin/login')
  requireRole(role, CHEF_ROLES)

  const user = await getCurrentPrismaUser()
  if (!user?.id) redirect('/admin/login')

  const data = await getEarningsProjections(user.id)

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Link href="/chef" className="text-sm text-[#1a5f3f] hover:underline mb-4 inline-block">
        ← Chef Dashboard
      </Link>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Earnings Projections</h1>
      <p className="text-sm text-gray-600 mb-6">
        Based on confirmed bookings and your availability. Estimates are not guaranteed.
      </p>

      {data.disabled && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 mb-6">
          <p className="text-sm text-amber-900">
            Projection estimates are currently disabled. Only confirmed booking amounts are shown.
          </p>
        </div>
      )}

      <div className="space-y-4">
        <ProjectionCard period={data.next30Days} disabled={data.disabled} />
        <ProjectionCard period={data.thisMonth} disabled={data.disabled} />
        <ProjectionCard period={data.next90Days} disabled={data.disabled} />
      </div>

      <p className="text-xs text-gray-500 mt-6">
        Estimates vary by availability and performance. Not a guarantee of earnings.
      </p>
    </div>
  )
}

function ProjectionCard({
  period,
  disabled,
}: {
  period: {
    label: string
    confirmedCents: number
    availableDays: number
    estimatedCentsMin: number
    estimatedCentsMax: number
  }
  disabled: boolean
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <h2 className="font-semibold text-gray-900 mb-3">{period.label}</h2>
      <div className="grid gap-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Confirmed</span>
          <span className="font-medium text-gray-900">{formatMoney(period.confirmedCents)}</span>
        </div>
        {!disabled && (period.estimatedCentsMin > 0 || period.estimatedCentsMax > 0) && (
          <div className="flex justify-between">
            <span className="text-gray-600">Estimated (from open slots)</span>
            <span className="font-medium text-gray-700">
              {formatMoney(period.estimatedCentsMin)} – {formatMoney(period.estimatedCentsMax)}
            </span>
          </div>
        )}
        {period.availableDays > 0 && (
          <div className="flex justify-between text-gray-500">
            <span>Available days in period</span>
            <span>{period.availableDays}</span>
          </div>
        )}
      </div>
    </div>
  )
}
