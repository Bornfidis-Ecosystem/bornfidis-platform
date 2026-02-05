import { redirect } from 'next/navigation'
import { UserRole } from '@prisma/client'
import { getCurrentUserRole } from '@/lib/get-user-role'
import ChefBottomNav from '@/components/chef/ChefBottomNav'

export const dynamic = 'force-dynamic'

/**
 * Phase 2F — Chef area layout.
 * Phase 2AE — Mobile-first: bottom nav (md:hidden), content padding so nav doesn't overlap.
 */
export default async function ChefLayout({
  children,
}: {
  children: React.ReactNode
}) {
  let role: string | null = null
  try {
    role = await getCurrentUserRole()
  } catch (e) {
    console.error('Chef layout auth check:', e)
    redirect('/admin/login')
  }

  if (!role) redirect('/admin/login')

  const chefRoles = [UserRole.CHEF, UserRole.ADMIN, UserRole.STAFF, UserRole.COORDINATOR]
  if (!chefRoles.includes(role as UserRole)) {
    redirect('/admin')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-30 border-b border-gray-200 bg-white px-4 py-3 md:py-3">
        <a href="/chef" className="text-sm font-medium text-gray-900 hover:text-green-700">
          Bornfidis Chef
        </a>
      </header>
      <main className="pb-20 md:pb-6">
        <ChefOfflineWrap>{children}</ChefOfflineWrap>
      </main>
      <ChefBottomNav />
    </div>
  )
}
