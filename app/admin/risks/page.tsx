import Link from 'next/link'
import { getCurrentUserRole } from '@/lib/get-user-role'
import { listRisksAction } from './actions'
import RisksClient from './RisksClient'

export const dynamic = 'force-dynamic'

/** Phase 2BC — Risk Register. Admin/Staff only. */
export default async function AdminRisksPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; status?: string }>
}) {
  const role = await getCurrentUserRole()
  const roleStr = role ? String(role).toUpperCase() : ''
  if (roleStr !== 'ADMIN' && roleStr !== 'STAFF') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-8">
        <h1 className="text-xl font-semibold text-red-600">Access Denied</h1>
        <p className="text-gray-600">Risk register is available to Admin and Staff only.</p>
        <a href="/admin" className="text-[#1a5f3f] hover:underline">Back to Dashboard</a>
      </div>
    )
  }

  const params = await searchParams
  const category = params.category?.trim() || undefined
  const status =
    params.status === 'OPEN' || params.status === 'MONITORING' || params.status === 'CLOSED'
      ? params.status
      : undefined

  const risks = await listRisksAction({ category, status })

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        <Link href="/admin" className="text-sm text-[#1a5f3f] hover:underline mb-4 inline-block">
          ← Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Risk register</h1>
        <p className="text-sm text-gray-600 mb-6">
          Single source of truth for operational, financial, quality, capacity, tech, and compliance risks. Log risk, assign owner, define mitigation, review monthly.
        </p>
        <RisksClient initialRisks={risks} initialCategory={category} initialStatus={status} />
      </div>
    </div>
  )
}
