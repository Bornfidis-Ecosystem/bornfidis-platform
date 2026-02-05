import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { UserRole } from '@prisma/client'
import { getCurrentUserRole } from '@/lib/get-user-role'
import { getPartnerProfileForCurrentUser } from '@/lib/partner'

export const dynamic = 'force-dynamic'

/**
 * Phase 2C — Partner area layout
 * - Requires auth (middleware sends unauthenticated to login).
 * - PARTNER only; others redirect to /admin.
 * - If PARTNER and profile not completed and not on /partner/setup → redirect to /partner/setup.
 */
export default async function PartnerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  let role: string | null = null
  let profile: Awaited<ReturnType<typeof getPartnerProfileForCurrentUser>> = null
  try {
    role = await getCurrentUserRole()
    profile = await getPartnerProfileForCurrentUser()
  } catch (e) {
    console.error('Partner layout auth check:', e)
    redirect('/admin/login')
  }

  const headersList = await headers()
  const pathname = headersList.get('x-pathname') ?? ''

  if (!role) {
    redirect('/admin/login')
  }

  // Phase 2F: PARTNER, FARMER, CHEF can all use partner area (setup + dashboard)
  const partnerAreaRoles = [UserRole.PARTNER, UserRole.FARMER, UserRole.CHEF]
  if (!role || !partnerAreaRoles.includes(role as UserRole)) {
    redirect('/admin')
  }

  const isSetupPage = pathname === '/partner/setup' || pathname.startsWith('/partner/setup/')
  const mustCompleteSetup = !profile || !profile.completed

  if (mustCompleteSetup && !isSetupPage) {
    redirect('/partner/setup')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white px-4 py-3">
        <a href="/partner" className="text-sm font-medium text-gray-900 hover:text-green-700">
          Bornfidis Partner
        </a>
      </header>
      {children}
    </div>
  )
}
