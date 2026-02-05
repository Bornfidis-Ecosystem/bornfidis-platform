import { redirect } from 'next/navigation'
import { UserRole } from '@prisma/client'
import { getCurrentUserRole } from '@/lib/get-user-role'
import { getPartnerProfileForCurrentUser } from '@/lib/partner'

export const dynamic = 'force-dynamic'

/**
 * Phase 2F — Farmer area layout
 * FARMER only (and ADMIN/STAFF). Others redirect to admin or partner.
 */
export default async function FarmerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  let role: string | null = null
  try {
    role = await getCurrentUserRole()
  } catch (e) {
    console.error('Farmer layout auth check:', e)
    redirect('/admin/login')
  }

  if (!role) redirect('/admin/login')

  const farmerRoles = [UserRole.FARMER, UserRole.ADMIN, UserRole.STAFF, UserRole.COORDINATOR]
  if (!farmerRoles.includes(role as UserRole)) {
    redirect('/admin')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white px-4 py-3">
        <a href="/farmer" className="text-sm font-medium text-gray-900 hover:text-green-700">
          Bornfidis Farmer
        </a>
      </header>
      {children}
    </div>
  )
}
