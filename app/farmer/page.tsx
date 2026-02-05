import { getCurrentUserRole } from '@/lib/get-user-role'
import { getPartnerProfileForCurrentUser } from '@/lib/partner'
import { requireRole } from '@/lib/require-role'
import { FARMER_ROLES } from '@/lib/require-role'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

/**
 * Phase 2G — Farmer Dashboard (production-ready).
 * FARMER, ADMIN, STAFF only. Guard in layout + explicit requireRole here.
 */
export default async function FarmerDashboard() {
  const role = await getCurrentUserRole()
  if (!role) redirect('/admin/login')

  requireRole(role, FARMER_ROLES)

  const profile = await getPartnerProfileForCurrentUser()
  if (!profile || !profile.completed) {
    redirect('/partner/setup')
  }

  return (
    <div className="space-y-6 p-6 max-w-4xl mx-auto">
      <header>
        <h1 className="text-xl font-semibold text-gray-900">
          Farmer Dashboard — {profile.displayName}
        </h1>
        <p className="text-sm text-gray-500">
          Parish: {profile.parish || 'Not set'}
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <FarmerCard
          title="My Farm Profile"
          description="View and update your farm details"
          href="/farmer/profile"
        />
        <FarmerCard
          title="Crop Planning"
          description="Declare crops and planting cycles"
          href="/farmer/crops"
        />
        <FarmerCard
          title="Market Demand"
          description="See what buyers are requesting"
          href="/farmer/demand"
        />
      </section>

      <section className="rounded-lg border border-gray-200 bg-white p-4">
        <h2 className="mb-2 font-medium text-gray-900">What to do first</h2>
        <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
          <li>Confirm your farm profile details</li>
          <li>Add at least one crop you grow</li>
          <li>Review current ProJu demand signals</li>
        </ul>
      </section>

      <p className="text-sm text-gray-500">
        <Link href="/partner" className="text-green-700 hover:underline">← Partner home</Link>
      </p>
    </div>
  )
}

function FarmerCard({
  title,
  description,
  href,
}: {
  title: string
  description: string
  href: string
}) {
  return (
    <Link
      href={href}
      className="rounded-lg border border-gray-200 bg-white p-4 hover:bg-gray-50 transition block"
    >
      <h3 className="font-medium text-gray-900">{title}</h3>
      <p className="text-sm text-gray-500 mt-1">{description}</p>
    </Link>
  )
}
