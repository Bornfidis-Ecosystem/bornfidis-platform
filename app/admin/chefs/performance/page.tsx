import Link from 'next/link'
import { getChefIdsWithAssignments } from '@/lib/chef-performance'

export const dynamic = 'force-dynamic'

/**
 * Phase 2N — Admin: List chefs (Prisma users with assignments) with links to performance.
 */
export default async function AdminChefPerformanceIndexPage() {
  const chefs = await getChefIdsWithAssignments()

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-xl font-semibold text-gray-900">Chef performance</h1>
      <p className="text-sm text-gray-500">
        Select a chef to view on-time rate, prep completion, avg payout, and last jobs.
      </p>

      {chefs.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-gray-500">
          No chefs with assignments yet. Assignments are created when admin assigns a chef to a booking (Prisma).
        </div>
      ) : (
        <ul className="space-y-2">
          {chefs.map((c) => (
            <li key={c.id}>
              <Link
                href={`/admin/chefs/${c.id}/performance`}
                className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 hover:bg-gray-50"
              >
                <span className="font-medium text-gray-900">{c.name || 'Unnamed chef'}</span>
                <span className="text-sm text-gray-500">View performance →</span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <Link href="/admin" className="text-sm text-green-700 hover:underline">
        ← Dashboard
      </Link>
    </div>
  )
}
