import { notFound, redirect } from 'next/navigation'
import { getCurrentUserRole } from '@/lib/get-user-role'
import { canAssignRoles } from '@/lib/authz'
import UserManagementClient from './UserManagementClient'
import SignOutButton from '@/components/admin/SignOutButton'
import Link from 'next/link'

/**
 * Phase 4: User Management Page
 * Admin-only page for managing user roles
 */
export default async function UserManagementPage() {
  const userRole = await getCurrentUserRole()

  // Only ADMIN can access this page
  if (!canAssignRoles(userRole)) {
    redirect('/admin')
  }

  return (
    <div className="min-h-screen bg-gray-50">
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
        <div className="bg-white rounded-lg shadow-sm p-6">
          <UserManagementClient />
        </div>
      </main>
    </div>
  )
}
