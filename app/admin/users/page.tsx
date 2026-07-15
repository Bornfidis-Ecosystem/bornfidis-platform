import { redirect } from 'next/navigation'
import { isFounderAdminRole, resolveAdminPlatformRole } from '@/lib/admin-rbac'
import UserManagementClient from './UserManagementClient'
import SignOutButton from '@/components/admin/SignOutButton'
import Link from 'next/link'
import { CulinaryCard } from '@/components/culinary-os'

/**
 * Phase 4: User Management Page
 * Founder admin only — managing user roles
 */
export default async function UserManagementPage() {
  if (!isFounderAdminRole(await resolveAdminPlatformRole())) {
    redirect('/admin')
  }

  return (
    <div className="min-h-screen bg-culinary-bone">
      {/* Header */}
      <header className="bg-navy text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <Link
                href="/admin"
                className="text-gold hover:underline text-sm mb-2 inline-block"
              >
                ← Back to Admin
              </Link>
              <h1 className="text-2xl font-bold">🧑 User Management</h1>
              <p className="text-gold text-sm mt-1">Manage user roles and permissions</p>
            </div>
            <SignOutButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <CulinaryCard className="p-6">
          <UserManagementClient />
        </CulinaryCard>
      </main>
    </div>
  )
}
