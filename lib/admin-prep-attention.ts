import { db } from '@/lib/db'
import { BOOKING_CHECKLIST_WRITABLE_KEYS } from '@/lib/bookings/checklist'

/**
 * Execution-readiness gates: incomplete on any of these hides “ready” for prep
 * (matches product spec — dietary is tracked in full checklist but not this gate).
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
  /** Short labels for prep gate fields still false (e.g. Menu, Guest count). */
  missingPrepLabels: string[]
  missingPrepCount: number
}

/**
 * Bookings with event in the next 7 days (inclusive window from start of today)
 * where at least one prep-gate checklist item is still incomplete.
 */
export async function getPrepAttentionNeeded(): Promise<PrepAttentionBooking[]> {
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const windowEnd = new Date(todayStart)
  windowEnd.setDate(windowEnd.getDate() + 7)

  const rows = await db.bookingInquiry.findMany({
    where: {
      eventDate: { gte: todayStart, lte: windowEnd },
      OR: PREP_GATE_FIELDS.map(({ prismaKey }) => ({ [prismaKey]: false })),
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
    },
    orderBy: [{ eventDate: 'asc' }, { createdAt: 'asc' }],
  })

  return rows.map((r) => {
    const missingPrepLabels = PREP_GATE_FIELDS.filter((f) => !r[f.prismaKey]).map((f) => f.short)
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
}
