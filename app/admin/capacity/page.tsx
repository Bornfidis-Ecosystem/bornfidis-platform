import Link from 'next/link'
import { getCurrentUserRole } from '@/lib/get-user-role'
import { getPlan, getConfig } from './actions'
import CapacityClient from './CapacityClient'
import type { CapacityHorizon } from '@/lib/capacity-planning'

export const dynamic = 'force-dynamic'

export default async function AdminCapacityPage({
  searchParams,
}: {
  searchParams: Promise<{ horizon?: string }>
}) {
  const role = await getCurrentUserRole()
  const roleStr = role ? String(role).toUpperCase() : ''
  if (roleStr !== 'ADMIN' && roleStr !== 'STAFF') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-8">
        <h1 className="text-xl font-semibold text-red-600">Access Denied</h1>
        <p className="text-gray-600">Capacity planning is available to Admin and Staff only.</p>
        <a href="/admin" className="text-[#1a5f3f] hover:underline">Back to Dashboard</a>
      </div>
    )
  }

  const params = await searchParams
  const horizonParam = params.horizon
  const horizon: CapacityHorizon =
    horizonParam === '6' ? 6 : horizonParam === '12' ? 12 : 3

  const [plan, config] = await Promise.all([getPlan(horizon), getConfig()])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        <Link href="/admin" className="text-sm text-[#1a5f3f] hover:underline mb-4 inline-block">
          ← Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Capacity planning</h1>
        <p className="text-sm text-gray-600 mb-6">
          Required chefs by month, gap vs current capacity, hire targets. Admin/Staff only.
        </p>
        <CapacityClient initialPlan={plan} initialConfig={config} />
      </div>
    </div>
  )
}
