import Link from 'next/link'
import { getCurrentPrismaUser } from '@/lib/partner'
import { getCurrentUserRole } from '@/lib/get-user-role'
import { requireRole } from '@/lib/require-role'
import { CHEF_ROLES } from '@/lib/require-role'
import { redirect } from 'next/navigation'
import { getChefTaxSummaryData } from '@/lib/chef-tax-summary'

export const dynamic = 'force-dynamic'

/**
 * Phase 2AF — Chef tax summaries portal. List years with data, link to download PDF.
 * Read-only. Informational summary only; no tax advice.
 */
export default async function ChefTaxSummariesPage() {
  const role = await getCurrentUserRole()
  if (!role) redirect('/admin/login')
  requireRole(role, CHEF_ROLES)

  const user = await getCurrentPrismaUser()
  if (!user?.id) redirect('/admin/login')

  const currentYear = new Date().getFullYear()
  const yearsToCheck = [currentYear - 1, currentYear - 2, currentYear - 3]
  const available: { year: number; totalGrossCents: number; jobCount: number }[] = []

  for (const y of yearsToCheck) {
    const data = await getChefTaxSummaryData(user.id, y)
    if (data) {
      available.push({
        year: data.year,
        totalGrossCents: data.totalGrossCents,
        jobCount: data.jobCount,
      })
    }
  }

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <Link href="/chef" className="text-sm text-[#1a5f3f] hover:underline mb-4 inline-block">
        ← Chef Dashboard
      </Link>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Tax Summaries</h1>
      <p className="text-sm text-gray-600 mb-6">
        Annual earnings summaries for your records. Informational only — not tax advice. Consult a tax professional for filing.
      </p>

      {available.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-6 text-center text-gray-500">
          <p>No tax summary data yet.</p>
          <p className="text-sm mt-2">Summaries are generated for years when you had paid payouts. You’ll receive an email when the annual summary is ready (e.g. mid-January for the prior year).</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {available.map((a) => (
            <li
              key={a.year}
              className="rounded-xl border border-gray-200 bg-white p-4 flex flex-wrap items-center justify-between gap-3"
            >
              <div>
                <p className="font-semibold text-gray-900">{a.year} Summary</p>
                <p className="text-sm text-gray-500">
                  {a.jobCount} job{a.jobCount !== 1 ? 's' : ''} · ${(a.totalGrossCents / 100).toFixed(2)} gross
                </p>
              </div>
              <a
                href={`/api/chef/tax-summary/${a.year}`}
                download={`Chef-Tax-Summary-${a.year}.pdf`}
                className="min-h-[44px] inline-flex items-center justify-center rounded-lg bg-[#1a5f3f] text-white px-4 py-3 text-sm font-medium hover:bg-[#144a30] touch-manipulation"
              >
                Download PDF
              </a>
            </li>
          ))}
        </ul>
      )}

      <p className="text-xs text-gray-400 mt-6">
        Summaries are generated annually (e.g. Jan 15 for prior year). Admin can resend if needed.
      </p>
    </div>
  )
}

