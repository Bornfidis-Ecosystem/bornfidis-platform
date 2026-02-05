import Link from 'next/link'
import { getCurrentUserRole } from '@/lib/get-user-role'
import { ensureDefaultSuccessionRoles, listRolesWithAssignments, listEligibleUsers } from '@/lib/succession'
import SuccessionClient from './SuccessionClient'
import type { RoleWithAssignments } from '@/lib/succession'

export const dynamic = 'force-dynamic'

/**
 * Phase 2BA — Workforce Succession Planning
 * Critical roles (Lead Chef Elite, Regional Coordinator, Ops Lead): primary + backups, readiness, training path.
 * Access: Admin/Staff only.
 */
export default async function AdminSuccessionPage() {
  const role = await getCurrentUserRole()
  const roleStr = role ? String(role).toUpperCase() : ''
  if (roleStr !== 'ADMIN' && roleStr !== 'STAFF') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-8">
        <h1 className="text-xl font-semibold text-red-600">Access Denied</h1>
        <p className="text-gray-600">Succession planning is available to Admin and Staff only.</p>
        <a href="/admin" className="text-[#1a5f3f] hover:underline">Back to Dashboard</a>
      </div>
    )
  }

  await ensureDefaultSuccessionRoles()
  const [roles, eligibleUsers] = await Promise.all([
    listRolesWithAssignments(),
    listEligibleUsers(),
  ])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        <Link href="/admin" className="text-sm text-[#1a5f3f] hover:underline mb-4 inline-block">
          ← Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Succession planning</h1>
        <p className="text-sm text-gray-600 mb-6">
          Ensure key roles are always covered. Every critical role should have at least one backup; set readiness and training paths.
        </p>
        <SuccessionClient initialRoles={roles} eligibleUsers={eligibleUsers} />
      </div>
    </div>
  )
}
