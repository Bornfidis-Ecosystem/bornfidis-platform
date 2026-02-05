import { getPartnerProfileForCurrentUser } from '@/lib/partner'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

/**
 * Phase 2E — Partner profile (review/update). Placeholder for now.
 */
export default async function PartnerProfilePage() {
  const profile = await getPartnerProfileForCurrentUser()
  if (!profile || !profile.completed) redirect('/partner/setup')

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-xl font-semibold text-gray-900">Partner profile</h1>
      <p className="text-sm text-gray-500">
        Review or update your partner details. Full profile editing will be available here soon.
      </p>
      <div className="rounded-lg border border-gray-200 bg-white p-4 space-y-2">
        <p><span className="font-medium text-gray-700">Display name:</span> {profile.displayName}</p>
        <p><span className="font-medium text-gray-700">Type:</span> {profile.partnerType}</p>
        {profile.parish && <p><span className="font-medium text-gray-700">Parish:</span> {profile.parish}</p>}
      </div>
      <Link href="/partner" className="text-sm text-green-700 hover:underline">← Back to dashboard</Link>
    </div>
  )
}
