import { getPartnerProfileForCurrentUser } from '@/lib/partner'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import type { PartnerType } from '@prisma/client'

export const dynamic = 'force-dynamic'

/**
 * Phase 2E — Partner Dashboard (production-ready).
 * Role and setup-complete guard handled by layout.
 */
export default async function PartnerDashboard() {
  const profile = await getPartnerProfileForCurrentUser()

  if (!profile || !profile.completed) {
    redirect('/partner/setup')
  }

  return (
    <div className="space-y-6 p-6 max-w-4xl mx-auto">
      <header>
        <h1 className="text-xl font-semibold text-gray-900">
          Welcome, {profile.displayName}
        </h1>
        <p className="text-sm text-gray-500">
          Partner type: {formatPartnerType(profile.partnerType)}
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <DashboardCard
          title="Profile"
          description="Review or update your partner details"
          href="/partner/profile"
        />
        <DashboardCard
          title="Opportunities"
          description="View requests, bookings, or demand signals"
          href="/partner/opportunities"
        />
        <DashboardCard
          title="Education"
          description="Training, standards, and onboarding resources"
          href="/partner/education"
        />
      </section>

      <section className="rounded-lg border border-gray-200 bg-white p-4">
        <h2 className="mb-2 font-medium text-gray-900">What&apos;s next?</h2>
        <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
          <li>Complete your partner profile</li>
          <li>Review ecosystem standards</li>
          <li>Respond to opportunities when available</li>
        </ul>
      </section>
    </div>
  )
}

function formatPartnerType(type: PartnerType): string {
  const labels: Record<PartnerType, string> = {
    FARMER: 'Farmer',
    CHEF: 'Chef',
    COOPERATIVE: 'Cooperative',
    OTHER: 'Other',
  }
  return labels[type] ?? type
}

function DashboardCard({
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
