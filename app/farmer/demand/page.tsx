import { getPartnerProfileForCurrentUser } from '@/lib/partner'
import { getCurrentUserRole } from '@/lib/get-user-role'
import { requireRole } from '@/lib/require-role'
import { FARMER_ROLES } from '@/lib/require-role'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

/**
 * Phase 2G — Market demand (ProJu demand signals). Placeholder.
 */
export default async function FarmerDemandPage() {
  const role = await getCurrentUserRole()
  if (!role) redirect('/admin/login')
  requireRole(role, FARMER_ROLES)

  const profile = await getPartnerProfileForCurrentUser()
  if (!profile || !profile.completed) redirect('/partner/setup')

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-xl font-semibold text-gray-900">Market Demand</h1>
      <p className="text-sm text-gray-500">
        See what buyers are requesting. ProJu demand signals will appear here when available.
      </p>
      <div className="rounded-lg border border-gray-200 bg-white p-6 text-center text-gray-500">
        Demand signals coming soon.
      </div>
      <Link href="/farmer" className="text-sm text-green-700 hover:underline">← Back to dashboard</Link>
    </div>
  )
}

