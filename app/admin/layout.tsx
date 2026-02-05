import { redirect } from 'next/navigation'
import { checkAdminAccess } from '@/lib/requireAdmin'
import AdminHeaderBar from '@/components/admin/AdminHeaderBar'
import { AppNav } from '@/components/AppNav'

/**
 * Force dynamic rendering to prevent caching issues
 */
export const dynamic = 'force-dynamic'
export const revalidate = 0

/**
 * Admin Layout — Bornfidis Auth + Roles (Phase 1) + Phase 2A (role-aware nav)
 * Protects all /admin/* routes. Allowed roles: ADMIN, STAFF, COORDINATOR.
 * Shows role badge + email bar; nav filtered by role.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const result = await checkAdminAccess()

  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 AdminLayout auth check:', {
      hasUser: !!result.user,
      isAdmin: result.isAdmin,
      role: result.role,
      email: result.user?.email,
    })
  }

  if (!result.user) {
    redirect('/admin/login')
  }

  // Phase 2F: Redirect PARTNER/FARMER/CHEF to their dashboards (no "Access Denied")
  if (!result.isAdmin && result.role) {
    const role = String(result.role).toUpperCase()
    if (role === 'FARMER') redirect('/farmer')
    if (role === 'CHEF') redirect('/chef')
    if (role === 'PARTNER') redirect('/partner')
  }

  if (!result.isAdmin) {
    const debugInfo = process.env.NODE_ENV === 'development'
      ? { email: result.user?.email, role: result.role, error: result.error }
      : null

    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-8">
        <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
        <p className="text-gray-600">
          You need an admin-area role (ADMIN, STAFF, or COORDINATOR) to access this page.
        </p>
        {debugInfo && (
          <div className="mt-4 p-4 bg-gray-100 rounded text-sm font-mono max-w-lg text-left">
            <strong>Debug (dev only):</strong>
            <pre className="mt-2 whitespace-pre-wrap">{JSON.stringify(debugInfo, null, 2)}</pre>
            <p className="mt-2 text-xs text-gray-500">
              <a href="/api/admin/debug-auth" target="_blank" className="text-green-700 underline">/api/admin/debug-auth</a>
            </p>
          </div>
        )}
        <a href="/admin/login" className="text-green-800 underline mt-2">Back to Login</a>
      </div>
    )
  }

  return (
    <>
      <AdminHeaderBar user={result.user} role={result.role} />
      <div className="border-b border-gray-200 bg-white px-4 py-2">
        <AppNav role={result.role} />
      </div>
      <AdminPushWrap />
      {children}
    </>
  )
}
