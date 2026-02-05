import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getCurrentUserRole } from '@/lib/get-user-role'
import { getInvestorReportData } from '@/lib/investor-report'
import InvestorReportClient from './InvestorReportClient'

export const dynamic = 'force-dynamic'

/** Phase 2AS — Investor Reporting. Admin only (not Staff). */
export default async function AdminInvestorsPage() {
  const role = await getCurrentUserRole()
  const roleStr = role ? String(role).toUpperCase() : ''
  if (roleStr !== 'ADMIN') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-8">
        <h1 className="text-xl font-semibold text-red-600">Access Denied</h1>
        <p className="text-gray-600">Investor reporting is available to Admin only.</p>
        <Link href="/admin" className="text-[#1a5f3f] hover:underline">Back to Dashboard</Link>
      </div>
    )
  }

  const data = await getInvestorReportData()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        <Link href="/admin" className="text-sm text-[#1a5f3f] hover:underline mb-4 inline-block">
          ← Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Investor report</h1>
        <p className="text-sm text-gray-600 mb-6">
          Monthly/quarterly snapshot: revenue, growth, quality, unit economics, outlook. Read-only. Export PDF or CSV.
        </p>
        <InvestorReportClient data={data} />
      </div>
    </div>
  )
}
