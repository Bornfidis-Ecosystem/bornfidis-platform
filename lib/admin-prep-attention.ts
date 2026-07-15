import { db } from '@/lib/db'
import { BOOKING_CHECKLIST_WRITABLE_KEYS } from '@/lib/bookings/checklist'

/**
 * @deprecated Phase 8 — Legacy boolean gate fields on BookingInquiry.
 * BookingPrepItem rows are now the source of truth.
 * Boolean gates are used as fallback for bookings that predate Phase 8.
 */
const PREP_GATE_FIELDS = [
  { prismaKey: 'menuConfirmed' as const, short: 'Menu' },
  { prismaKey: 'guestCountConfirmed' as const, short: 'Guest count' },
  { prismaKey: 'arrivalTimeConfirmed' as const, short: 'Arrival time' },
  { prismaKey: 'locationConfirmed' as const, short: 'Location' },
  { prismaKey: 'ingredientsSourced' as const, short: 'Ingredients' },
  { prismaKey: 'equipmentPacked' as const, short: 'Equipment' },
]

type ChecklistRow = {
  menuConfirmed: boolean
  dietaryConfirmed: boolean
  guestCountConfirmed: boolean
  arrivalTimeConfirmed: boolean
  locationConfirmed: boolean
  ingredientsSourced: boolean
  equipmentPacked: boolean
  paidAt: Date | null
  balancePaidAt: Date | null
  fullyPaidAt: Date | null
  testimonialRequestedAt: Date | null
}

function countChecklistDone(row: ChecklistRow): number {
  let d = 0
  for (const k of BOOKING_CHECKLIST_WRITABLE_KEYS) {
    if (row[k]) d += 1
  }
  if (row.paidAt) d += 1
  if (row.balancePaidAt || row.fullyPaidAt) d += 1
  if (row.testimonialRequestedAt) d += 1
  return d
}

export type PrepAttentionBooking = {
  id: string
  name: string
  status: string
  eventDate: Date
  doneCount: number
  totalCount: number
  missingPrepLabels: string[]
  missingPrepCount: number
  /** Phase 8: overdue prep items (only when task rows exist). */
  overdue?: number
}

/**
 * Phase 8 — Unified prep attention query.
 * Uses BookingPrepItem rows as source of truth when they exist.
 * Falls back to legacy inline boolean gates for pre-Phase-8 bookings.
 */
export async function getPrepAttentionNeeded(): Promise<PrepAttentionBooking[]> {
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const windowEnd = new Date(todayStart)
  windowEnd.setDate(windowEnd.getDate() + 7)

  const rows = await db.bookingInquiry.findMany({
    where: {
      eventDate: { gte: todayStart, lte: windowEnd },
      NOT: {
        OR: [
          { status: { equals: 'cancelled', mode: 'insensitive' } },
          { status: { equals: 'declined', mode: 'insensitive' } },
          { status: { equals: 'closed', mode: 'insensitive' } },
        ],
      },
    },
    select: {
      id: true,
      name: true,
      status: true,
      eventDate: true,
      menuConfirmed: true,
      dietaryConfirmed: true,
      guestCountConfirmed: true,
      arrivalTimeConfirmed: true,
      locationConfirmed: true,
      ingredientsSourced: true,
      equipmentPacked: true,
      paidAt: true,
      balancePaidAt: true,
      fullyPaidAt: true,
      testimonialRequestedAt: true,
      prepItems: {
        select: { status: true, dueAt: true, completed: true, title: true },
      },
    },
    orderBy: [{ eventDate: 'asc' }, { createdAt: 'asc' }],
  })

  return rows
    .map((r) => {
      if (r.prepItems.length > 0) {
        const total = r.prepItems.length
        const completed = r.prepItems.filter((t) => t.status === 'completed').length
        const overdue = r.prepItems.filter(
          (t) => t.dueAt && t.dueAt < now && t.status !== 'completed' && t.status !== 'cancelled',
        ).length
        const incomplete = r.prepItems.filter(
          (t) => t.status !== 'completed' && t.status !== 'cancelled',
        )
        if (completed >= total) return null

        return {
          id: r.id,
          name: r.name,
          status: r.status,
          eventDate: r.eventDate,
          doneCount: completed,
          totalCount: total,
          missingPrepLabels: incomplete.slice(0, 3).map((t) => t.title),
          missingPrepCount: incomplete.length,
          overdue,
        }
      }

      const missingPrepLabels = PREP_GATE_FIELDS.filter((f) => !r[f.prismaKey]).map((f) => f.short)
      if (missingPrepLabels.length === 0) return null

      return {
        id: r.id,
        name: r.name,
        status: r.status,
        eventDate: r.eventDate,
        doneCount: countChecklistDone(r),
        totalCount: 10,
        missingPrepLabels,
        missingPrepCount: missingPrepLabels.length,
      }
    })
    .filter((r): r is PrepAttentionBooking => r !== null)
}
