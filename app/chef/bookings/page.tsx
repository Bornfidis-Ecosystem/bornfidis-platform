import { getPartnerProfileForCurrentUser } from '@/lib/partner'
import { getCurrentUserRole } from '@/lib/get-user-role'
import { requireRole } from '@/lib/require-role'
import { CHEF_ROLES } from '@/lib/require-role'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { db } from '@/lib/db'
import { getCurrentPrismaUser } from '@/lib/partner'
import { ChefBookingsClient } from './ChefBookingsClient'

export const dynamic = 'force-dynamic'

/**
 * Phase 2I — Chef bookings list. Only assignments for current chef (CHEF, ADMIN, STAFF).
 */
export default async function ChefBookingsPage() {
  const role = await getCurrentUserRole()
  if (!role) redirect('/admin/login')
  requireRole(role, CHEF_ROLES)

  const profile = await getPartnerProfileForCurrentUser()
  if (!profile?.completed) redirect('/partner/setup')

  const user = await getCurrentPrismaUser()
  if (!user?.id) redirect('/admin/login')

  // Admin/Staff see all; chef sees only their own
  const isChefOnly = String(role).toUpperCase() === 'CHEF'
  const assignments = await db.chefAssignment.findMany({
    where: isChefOnly ? { chefId: user.id } : undefined,
    orderBy: { createdAt: 'desc' },
    include: {
      booking: {
        select: {
          id: true,
          name: true,
          location: true,
          eventDate: true,
          eventTime: true,
          dietaryRestrictions: true,
          specialRequests: true,
        },
      },
    },
  })

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6 overflow-x-hidden">
      <h1 className="text-xl font-semibold text-gray-900">Bookings</h1>
      <p className="text-sm text-gray-500">
        Upcoming jobs and prep. Confirm availability, follow prep steps, and mark jobs complete.
      </p>

      <ChefBookingsClient
        assignments={assignments.map((a) => ({
          id: a.id,
          status: a.status,
          notes: a.notes,
          booking: {
            id: a.booking.id,
            name: a.booking.name,
            location: a.booking.location,
            eventDate: a.booking.eventDate,
            eventTime: a.booking.eventTime,
            dietaryRestrictions: a.booking.dietaryRestrictions,
            specialRequests: a.booking.specialRequests,
          },
        }))}
      />

      <Link href="/chef" className="text-sm text-green-700 hover:underline">← Back to dashboard</Link>
    </div>
  )
}
