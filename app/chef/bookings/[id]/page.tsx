import { getPartnerProfileForCurrentUser } from '@/lib/partner'
import { getCurrentUserRole } from '@/lib/get-user-role'
import { getCurrentPrismaUser } from '@/lib/partner'
import { requireRole } from '@/lib/require-role'
import { CHEF_ROLES } from '@/lib/require-role'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import { ChefBookingDetailClient } from './ChefBookingDetailClient'

export const dynamic = 'force-dynamic'

/**
 * Phase 2I — Chef booking detail. CHEF sees only their assignment; ADMIN/STAFF see any.
 */
export default async function ChefBookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id: bookingId } = await params
  const role = await getCurrentUserRole()
  if (!role) redirect('/admin/login')
  requireRole(role, CHEF_ROLES)

  const profile = await getPartnerProfileForCurrentUser()
  if (!profile?.completed) redirect('/partner/setup')

  const user = await getCurrentPrismaUser()
  if (!user?.id) redirect('/admin/login')

  const isChefOnly = String(role).toUpperCase() === 'CHEF'
  const assignment = await db.chefAssignment.findFirst({
    where: {
      bookingId,
      ...(isChefOnly ? { chefId: user.id } : {}),
    },
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
          menuPreferences: true,
        },
      },
    },
  })

  if (!assignment) notFound()

  // Phase 2K: Load default template and chef prep checklist for this booking
  const template = await db.prepChecklistTemplate.findFirst({ orderBy: { createdAt: 'asc' } })
  const checklist = await db.chefPrepChecklist.findUnique({
    where: { bookingId },
  })
  const templateItems = (template?.items as { label: string; required: boolean }[]) ?? []
  const completed = (checklist?.completed as Record<string, boolean>) ?? {}

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-xl font-semibold text-gray-900 mb-6">Booking detail</h1>
      <ChefBookingDetailClient
        assignmentId={assignment.id}
        status={assignment.status}
        notes={assignment.notes}
        bookingId={assignment.booking.id}
        booking={{
          id: assignment.booking.id,
          name: assignment.booking.name,
          location: assignment.booking.location,
          eventDate: assignment.booking.eventDate,
          eventTime: assignment.booking.eventTime,
          dietaryRestrictions: assignment.booking.dietaryRestrictions,
          specialRequests: assignment.booking.specialRequests,
          menuPreferences: assignment.booking.menuPreferences,
        }}
        prepTemplateName={template?.name ?? null}
        prepItems={templateItems}
        prepCompleted={completed}
      />
    </div>
  )
}
