import Link from 'next/link'
import { getCurrentUserRole } from '@/lib/get-user-role'
import { requireRole } from '@/lib/require-role'
import { redirect } from 'next/navigation'
import { getEducationAnalytics } from '@/lib/education-analytics'

export const dynamic = 'force-dynamic'

const ANALYTICS_ROLES = ['ADMIN', 'STAFF']

/**
 * Phase 2O — Education Analytics. Admin/Staff only.
 * Completion rates, per-module table, non-compliant users.
 */
export default async function AdminEducationAnalyticsPage() {
  const role = await getCurrentUserRole()
  if (!role) redirect('/admin/login')
  requireRole(role, ANALYTICS_ROLES)

  const analytics = await getEducationAnalytics()

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Education analytics</h1>
        <Link
          href="/admin/education"
          className="text-sm text-green-700 hover:underline"
        >
          ← Manage modules
        </Link>
      </div>
      <p className="text-sm text-gray-500">
        Training completion and gaps. Required modules must be complete for payout gate and quality.
      </p>

      {/* Cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Overall completion
          </p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">
            {analytics.overallCompletionPercent}%
          </p>
          <p className="mt-0.5 text-xs text-gray-500">
            All modules · {analytics.totalChefUsers} chef{analytics.totalChefUsers !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Required modules completion
          </p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">
            {analytics.requiredCompletionPercent}%
          </p>
          <p className="mt-0.5 text-xs text-gray-500">
            Required only
          </p>
        </div>
      </div>

      {/* Table: Module | Required | Completed | Outstanding */}
      <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
        <h2 className="px-4 py-3 text-sm font-semibold text-gray-700 border-b border-gray-200">
          Per module
        </h2>
        {analytics.moduleRows.length === 0 ? (
          <p className="px-4 py-6 text-sm text-gray-500 text-center">
            No CHEF modules yet. Add modules in Education.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-100 border-b border-gray-200">
              <tr>
                <th className="px-4 py-2 text-left font-medium text-gray-700">Module</th>
                <th className="px-4 py-2 text-left font-medium text-gray-700">Required</th>
                <th className="px-4 py-2 text-right font-medium text-gray-700">Completed</th>
                <th className="px-4 py-2 text-right font-medium text-gray-700">Outstanding</th>
                <th className="px-4 py-2 text-right font-medium text-gray-700">Rate</th>
                <th className="px-4 py-2 text-right font-medium text-gray-700">Avg days</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {analytics.moduleRows.map((row) => (
                <tr key={row.moduleId} className="hover:bg-gray-50">
                  <td className="px-4 py-2 font-medium text-gray-900">{row.title}</td>
                  <td className="px-4 py-2">
                    {row.required ? (
                      <span className="rounded bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                        Required
                      </span>
                    ) : (
                      <span className="text-gray-500">Optional</span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-right text-gray-900">{row.completed}</td>
                  <td className="px-4 py-2 text-right text-gray-900">{row.outstanding}</td>
                  <td className="px-4 py-2 text-right text-gray-700">{row.completionRatePercent}%</td>
                  <td className="px-4 py-2 text-right text-gray-600">
                    {row.avgDaysToComplete != null ? `${row.avgDaysToComplete}d` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Non-compliant users */}
      <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
        <h2 className="px-4 py-3 text-sm font-semibold text-gray-700 border-b border-gray-200">
          Users missing required training
        </h2>
        {analytics.nonCompliantUsers.length === 0 ? (
          <p className="px-4 py-6 text-sm text-gray-500 text-center">
            All CHEF users have completed required modules.
          </p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {analytics.nonCompliantUsers.map((u) => (
              <li key={u.id} className="px-4 py-3 flex items-center justify-between">
                <span className="font-medium text-gray-900">{u.name || 'Unnamed'}</span>
                <span className="text-sm text-gray-500">{u.email ?? u.id}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Link href="/admin/education" className="text-sm text-green-700 hover:underline">
        ← Back to education
      </Link>
    </div>
  )
}
