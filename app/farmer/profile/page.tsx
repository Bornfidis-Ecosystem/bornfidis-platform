import { getPartnerProfileForCurrentUser } from '@/lib/partner'
import { getCurrentUserRole } from '@/lib/get-user-role'
import { requireRole } from '@/lib/require-role'
import { FARMER_ROLES } from '@/lib/require-role'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

/**
 * Phase 2G — Farmer farm profile (view/update). Placeholder for full farm details.
 */
export default async function FarmerProfilePage() {
  const role = await getCurrentUserRole()
  if (!role) redirect('/admin/login')
  requireRole(role, FARMER_ROLES)

  const profile = await getPartnerProfileForCurrentUser()
  if (!profile || !profile.completed) redirect('/partner/setup')

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-xl font-semibold text-gray-900">My Farm Profile</h1>
      <p className="text-sm text-gray-500">
        View and update your farm details. Full farm profile editing will be available here soon.
      </p>
      <div className="rounded-lg border border-gray-200 bg-white p-4 space-y-2">
        <p><span className="font-medium text-gray-700">Display name:</span> {profile.displayName}</p>
        <p><span className="font-medium text-gray-700">Parish:</span> {profile.parish || 'Not set'}</p>
        {profile.phone && <p><span className="font-medium text-gray-700">Phone:</span> {profile.phone}</p>}
      </div>
      <Link href="/farmer" className="text-sm text-green-700 hover:underline">← Back to dashboard</Link>
    </div>
  )
}
