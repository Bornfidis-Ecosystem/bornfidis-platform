import { getPartnerProfileForCurrentUser } from '@/lib/partner'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

/**
 * Phase 2E — Partner opportunities (requests, bookings, demand). Placeholder for now.
 */
export default async function PartnerOpportunitiesPage() {
  const profile = await getPartnerProfileForCurrentUser()
  if (!profile || !profile.completed) redirect('/partner/setup')

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-xl font-semibold text-gray-900">Opportunities</h1>
      <p className="text-sm text-gray-500">
        View requests, bookings, or demand signals when they are available. This section will be expanded with ProJu and booking integrations.
      </p>
      <div className="rounded-lg border border-gray-200 bg-white p-6 text-center text-gray-500">
        No opportunities at the moment. Check back later.
      </div>
      <Link href="/partner" className="text-sm text-green-700 hover:underline">← Back to dashboard</Link>
    </div>
  )
}

