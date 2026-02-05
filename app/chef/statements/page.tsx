import Link from 'next/link'
import { getCurrentUserRole } from '@/lib/get-user-role'
import { getCurrentPrismaUser } from '@/lib/partner'
import { requireRole } from '@/lib/require-role'
import { CHEF_ROLES } from '@/lib/require-role'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

/**
 * Phase 2T: Chef statements — monthly earnings PDFs.
 * Statements are emailed on the 1st; this page allows download for past months.
 */
export default async function ChefStatementsPage() {
  const role = await getCurrentUserRole()
  if (!role) redirect('/admin/login')
  requireRole(role, CHEF_ROLES)

  const user = await getCurrentPrismaUser()
  if (!user?.id) redirect('/admin/login')

  const now = new Date()
  const months: { year: number; month: number; label: string }[] = []
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    months.push({
      year: d.getFullYear(),
      month: d.getMonth() + 1,
      label: d.toLocaleString('en-US', { month: 'long', year: 'numeric' }),
    })
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-xl font-semibold text-gray-900">Monthly Statements</h1>
      <p className="text-sm text-gray-500">
        Your earnings statement is sent by email on the 1st of each month for the previous month.
        You can also download a PDF for any month below (only months with paid jobs will have data).
      </p>
      <ul className="space-y-2">
        {months.map(({ year, month, label }) => (
          <li key={`${year}-${month}`} className="flex items-center justify-between py-2 border-b border-gray-100">
            <span className="text-gray-900">{label}</span>
            <a
              href={`/api/chef/statements/${year}-${String(month).padStart(2, '0')}`}
              className="text-sm text-[#1a5f3f] hover:underline font-medium"
              download
            >
              Download PDF
            </a>
          </li>
        ))}
      </ul>
      <p className="text-sm text-gray-500">
        <Link href="/chef" className="text-[#1a5f3f] hover:underline">← Back to Chef dashboard</Link>
      </p>
    </div>
  )
}
