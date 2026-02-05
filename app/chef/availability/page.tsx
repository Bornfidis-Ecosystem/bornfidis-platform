import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getCurrentPrismaUser } from '@/lib/partner'
import { requireRole } from '@/lib/require-role'
import { getCurrentUserRole } from '@/lib/get-user-role'
import { CHEF_ROLES } from '@/lib/require-role'
import { getAvailabilityForChefMonth } from '@/lib/chef-availability'
import { getTimeSlotsForChefDay, getAssignmentsOnDay } from '@/lib/chef-time-slots'
import { getOrCreateCalendarToken } from '@/lib/chef-calendar'
import AvailabilityCalendar from '@/components/AvailabilityCalendar'
import TimeSlotsDayView from '@/components/TimeSlotsDayView'
import CalendarSyncSection from './CalendarSyncSection'
import { AvailabilityWeekStrip } from './AvailabilityWeekStrip'
import { addTimeSlotAction, updateTimeSlotAction, deleteTimeSlotAction } from './actions'

export const dynamic = 'force-dynamic'

/**
 * Phase 2V — Chef availability (own calendar).
 * Phase 2Y — Time slots per day (presets: Morning / Afternoon / Evening).
 */
export default async function ChefAvailabilityPage({
  searchParams,
}: {
  searchParams: Promise<{ y?: string; m?: string; d?: string }>
}) {
  const role = await getCurrentUserRole()
  if (!role) redirect('/admin/login')
  requireRole(role, CHEF_ROLES)

  const user = await getCurrentPrismaUser()
  if (!user?.id) redirect('/admin/login')

  const params = await searchParams
  const now = new Date()
  const year = params.y ? parseInt(params.y, 10) : now.getFullYear()
  const month = params.m ? parseInt(params.m, 10) : now.getMonth() + 1
  const validYear = Number.isFinite(year) && year >= 2020 && year <= 2100 ? year : now.getFullYear()
  const validMonth = Number.isFinite(month) && month >= 1 && month <= 12 ? month : now.getMonth() + 1
  const dayParam = params.d && /^\d{4}-\d{2}-\d{2}$/.test(params.d) ? params.d : null

  const nextMonthYear = validMonth === 12 ? validYear + 1 : validYear
  const nextMonthNum = validMonth === 12 ? 1 : validMonth + 1
  const [days, nextMonthDays, calendarToken] = await Promise.all([
    getAvailabilityForChefMonth(user.id, validYear, validMonth),
    getAvailabilityForChefMonth(user.id, nextMonthYear, nextMonthNum),
    getOrCreateCalendarToken(user.id),
  ])
  const daysByDate = new Map(days.map((d) => [d.date, d]))
  nextMonthDays.forEach((d) => daysByDate.set(d.date, d))
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')
  const calendarUrl = `${baseUrl}/api/chef/calendar?token=${encodeURIComponent(calendarToken)}`
  const [slotsForDay, bookingsOnDay] = dayParam
    ? await Promise.all([
        getTimeSlotsForChefDay(user.id, dayParam),
        getAssignmentsOnDay(user.id, dayParam),
      ])
    : [[], []]

  const prevMonth = validMonth === 1 ? { y: validYear - 1, m: 12 } : { y: validYear, m: validMonth - 1 }
  const nextMonth = validMonth === 12 ? { y: validYear + 1, m: 1 } : { y: validYear, m: validMonth + 1 }

  const today = new Date()
  today.setUTCHours(0, 0, 0, 0)
  const weekDates: Array<{ date: string; available: boolean; hasAssignment: boolean; label: string }> = []
  const dayLabels = ['Today', 'Tomorrow']
  for (let i = 0; i < 7; i++) {
    const d = new Date(today)
    d.setUTCDate(d.getUTCDate() + i)
    const y = d.getUTCFullYear()
    const m = String(d.getUTCMonth() + 1).padStart(2, '0')
    const day = String(d.getUTCDate()).padStart(2, '0')
    const dateKey = `${y}-${m}-${day}`
    const dayInfo = daysByDate.get(dateKey)
    weekDates.push({
      date: dateKey,
      available: dayInfo?.available ?? true,
      hasAssignment: dayInfo?.hasAssignment ?? false,
      label: i < 2 ? dayLabels[i] : d.toLocaleDateString('en-US', { weekday: 'short' }),
    })
  }

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <Link href="/chef" className="text-sm text-[#1a5f3f] hover:underline mb-4 inline-block">
        ← Chef Dashboard
      </Link>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">My Availability</h1>
      <p className="text-sm text-gray-600 mb-4">
        Mark days when you are available or unavailable. Busy = booking that day.
      </p>

      <AvailabilityWeekStrip chefId={user.id} days={weekDates} />

      <div className="flex gap-4 items-center mb-6">
        <Link
          href={`/chef/availability?y=${prevMonth.y}&m=${prevMonth.m}${dayParam ? `&d=${dayParam}` : ''}`}
          className="px-3 py-1.5 border border-gray-300 rounded text-sm hover:bg-gray-50"
        >
          ← Previous
        </Link>
        <span className="text-gray-600 font-medium">
          {new Date(validYear, validMonth - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}
        </span>
        <Link
          href={`/chef/availability?y=${nextMonth.y}&m=${nextMonth.m}${dayParam ? `&d=${dayParam}` : ''}`}
          className="px-3 py-1.5 border border-gray-300 rounded text-sm hover:bg-gray-50"
        >
          Next →
        </Link>
      </div>

      <AvailabilityCalendarOffline
        chefId={user.id}
        year={validYear}
        month={validMonth}
        days={days}
      />

      {/* Phase 2Y: Time slots — pick day via link or URL ?d= */}
      <div className="mt-6">
        <p className="text-sm text-gray-600 mb-2">Time slots: pick a day to add Morning / Afternoon / Evening blocks.</p>
        {!dayParam ? (
          <p className="text-sm text-gray-500">
            Add <code className="bg-gray-100 px-1 rounded">?d=YYYY-MM-DD</code> to the URL (e.g. for today) or use a day link below.
          </p>
        ) : (
          <TimeSlotsDayView
            chefId={user.id}
            date={dayParam}
            slots={slotsForDay}
            bookingsOnDay={bookingsOnDay}
            onAddSlot={async (date, start, end) => addTimeSlotAction(user.id, date, start, end)}
            onUpdateSlot={updateTimeSlotAction}
            onDeleteSlot={deleteTimeSlotAction}
          />
        )}
        {!dayParam && (
          <div className="flex flex-wrap gap-1 mt-2">
            {days.slice(0, 7).map((day) => (
              <Link
                key={day.date}
                href={`/chef/availability?y=${validYear}&m=${validMonth}&d=${day.date}`}
                className="text-xs px-2 py-1 border border-gray-200 rounded hover:bg-gray-100"
              >
                {day.date.slice(8)} {day.available ? '✓' : '—'}
              </Link>
            ))}
            <span className="text-xs text-gray-400 self-center ml-1">… first 7 days as quick links</span>
          </div>
        )}
      </div>

      <CalendarSyncSection initialCalendarUrl={calendarUrl} chefId={user.id} />
    </div>
  )
}
