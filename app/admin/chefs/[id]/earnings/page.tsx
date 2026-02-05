import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getChefById } from '../../actions'
import { getEarningsProjections } from '@/lib/chef-earnings-projections'
import { formatMoney } from '@/lib/money'
import SignOutButton from '@/components/admin/SignOutButton'

/**
 * Phase 2AC — Admin view of chef earnings projections (same data as chef, read-only).
 */
export default async function AdminChefEarningsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { success, chef } = await getChefById(id)
  if (!success || !chef) notFound()

  const data = await getEarningsProjections(id)

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-[#1a5f3f] text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <Link href={`/admin/chefs/${id}`} className="text-[#FFBC00] hover:underline text-sm mb-2 inline-block">
                ← {chef.name}
              </Link>
              <h1 className="text-2xl font-bold">Earnings Projections</h1>
              <p className="text-green-100 text-sm mt-1">Read-only. Same data the chef sees.</p>
            </div>
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        {data.disabled && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 mb-6">
            <p className="text-sm text-amber-900">Projection estimates are currently disabled.</p>
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
      </main>
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
