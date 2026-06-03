import Link from 'next/link'
import { db } from '@/lib/db'
import { requireManagerOrFounderPageAccess } from '@/lib/admin-rbac'
import { formatDateKey, getAdjacentMonthKey, getMonthGridDates, groupBookingsByDate, parseMonthQuery } from '@/lib/bookings/calendar-utils'
import { CulinaryCard } from '@/components/culinary-os'

export const dynamic = 'force-dynamic'

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="inline-flex items-center gap-2 text-sm text-gray-700">
      <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
      <span>{label}</span>
    </div>
  )
}

function getStatusChipClass(status?: string | null) {
  const normalized = (status || '').trim().toLowerCase()
  if (normalized === 'new') return 'bg-gray-100 text-gray-700 border-gray-200'
  if (normalized === 'quoted') return 'bg-amber-100 text-amber-800 border-amber-200'
  if (normalized === 'booked') return 'bg-blue-100 text-blue-800 border-blue-200'
  if (normalized === 'confirmed') return 'bg-green-100 text-green-800 border-green-200'
  if (normalized === 'completed')
    return 'border border-culinary-forest/30 bg-culinary-surface-low text-culinary-forest'
  if (normalized === 'cancelled' || normalized === 'canceled') return 'bg-red-100 text-red-800 border-red-200'
  return 'bg-gray-100 text-gray-700 border-gray-200'
}

type SearchParams = Promise<{ month?: string }>

export default async function AdminCalendarPage({ searchParams }: { searchParams: SearchParams }) {
  await requireManagerOrFounderPageAccess()

  const params = await searchParams
  const { monthStart, monthKey } = parseMonthQuery(params.month)
  const monthGrid = getMonthGridDates(monthStart)
  const gridStart = monthGrid[0]
  const gridEnd = monthGrid[monthGrid.length - 1]
  const todayKey = formatDateKey(new Date())

  const bookings = await db.bookingInquiry.findMany({
    where: {
      eventDate: {
        gte: new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate()),
        lte: new Date(gridEnd.getFullYear(), gridEnd.getMonth(), gridEnd.getDate()),
      },
    },
    select: {
      id: true,
      name: true,
      eventDate: true,
      status: true,
      eventType: true,
    },
    orderBy: [{ eventDate: 'asc' }, { createdAt: 'asc' }],
  })

  const bookingsByDate = groupBookingsByDate(bookings)
  const prevMonthKey = getAdjacentMonthKey(monthStart, -1)
  const nextMonthKey = getAdjacentMonthKey(monthStart, 1)
  const monthLabel = monthStart.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const thisMonthKey = parseMonthQuery(null).monthKey

  return (
    <div className="min-h-screen bg-culinary-bone">
      <header className="bg-navy text-white">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold">Admin Calendar</h1>
          <p className="text-gold text-sm mt-1">Booking schedule by event date</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <CulinaryCard className="p-4 sm:p-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-navy">{monthLabel}</h2>
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={`/admin/calendar?month=${prevMonthKey}`}
                className="rounded-none border border-culinary-outline bg-culinary-bone px-3 py-1.5 text-sm font-medium text-culinary-ink shadow-none hover:bg-culinary-surface-low"
              >
                Previous
              </Link>
              <Link
                href={`/admin/calendar?month=${thisMonthKey}`}
                className="rounded-none border border-culinary-outline bg-culinary-bone px-3 py-1.5 text-sm font-medium text-culinary-ink shadow-none hover:bg-culinary-surface-low"
              >
                Today
              </Link>
              <Link
                href={`/admin/calendar?month=${nextMonthKey}`}
                className="rounded-none border border-culinary-outline bg-culinary-bone px-3 py-1.5 text-sm font-medium text-culinary-ink shadow-none hover:bg-culinary-surface-low"
              >
                Next
              </Link>
            </div>
          </div>

          <CulinaryCard className="mb-4 flex flex-wrap items-center gap-3">
            <LegendItem color="bg-gray-400" label="New" />
            <LegendItem color="bg-amber-500" label="Quoted" />
            <LegendItem color="bg-blue-500" label="Booked" />
            <LegendItem color="bg-green-600" label="Confirmed" />
            <LegendItem color="bg-culinary-forest" label="Completed" />
            <LegendItem color="bg-red-500" label="Cancelled" />
          </CulinaryCard>

          <div className="grid grid-cols-7 overflow-hidden rounded-none border border-culinary-outline shadow-none">
            {WEEKDAY_LABELS.map((label) => (
              <div
                key={label}
                className="border-b border-culinary-outline bg-culinary-surface-low px-2 py-2 text-xs font-semibold uppercase tracking-wide text-culinary-text-muted"
              >
                {label}
              </div>
            ))}

            {monthGrid.map((date) => {
              const dateKey = formatDateKey(date)
              const isCurrentMonth = date.getMonth() === monthStart.getMonth()
              const isToday = dateKey === todayKey
              const dayBookings = bookingsByDate[dateKey] || []
              const visible = dayBookings.slice(0, 3)
              const remaining = Math.max(dayBookings.length - visible.length, 0)

              return (
                <div
                  key={dateKey}
                  className={`min-h-[130px] border-b border-r border-culinary-outline p-2 ${
                    isCurrentMonth ? 'bg-culinary-bone' : 'bg-culinary-surface-low'
                  }`}
                >
                  <div className="mb-2">
                    <span
                      className={`inline-flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-xs font-semibold ${
                        isToday ? 'bg-navy text-white' : isCurrentMonth ? 'text-gray-800' : 'text-gray-400'
                      }`}
                    >
                      {date.getDate()}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    {visible.map((booking) => (
                      <Link
                        key={booking.id}
                        href={`/admin/bookings/${booking.id}`}
                        className={`block rounded-none border px-2 py-1 text-[11px] leading-snug shadow-none hover:opacity-90 ${getStatusChipClass(booking.status)}`}
                        title={`${booking.name} — ${booking.eventType || 'Event'}`}
                      >
                        <div className="font-semibold truncate">{booking.name}</div>
                        <div className="truncate">{booking.eventType || 'Event'}</div>
                      </Link>
                    ))}
                    {remaining > 0 ? <p className="text-[11px] text-gray-500 font-medium">+{remaining} more</p> : null}
                  </div>
                </div>
              )
            })}
          </div>
        </CulinaryCard>
      </main>
    </div>
  )
}

