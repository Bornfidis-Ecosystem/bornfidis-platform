import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getChefById } from '../../actions'
import { getAvailabilityForChefMonth } from '@/lib/chef-availability'
import { getTimeSlotsForChefDay, getAssignmentsOnDay } from '@/lib/chef-time-slots'
import AvailabilityCalendar from '@/components/AvailabilityCalendar'
import TimeSlotsDayView from '@/components/TimeSlotsDayView'
import { setDayAvailabilityAdmin } from './actions'
import { addTimeSlotAction, updateTimeSlotAction, deleteTimeSlotAction } from '@/app/chef/availability/actions'
import SignOutButton from '@/components/admin/SignOutButton'

export const dynamic = 'force-dynamic'

/**
 * Phase 2V — Admin view/edit chef availability.
 */
export default async function AdminChefAvailabilityPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ y?: string; m?: string; d?: string }>
}) {
  const { id: chefId } = await params
  const { success, chef } = await getChefById(chefId)
  if (!success || !chef) notFound()

  const sp = await searchParams
  const now = new Date()
  const year = sp.y ? parseInt(sp.y, 10) : now.getFullYear()
  const month = sp.m ? parseInt(sp.m, 10) : now.getMonth() + 1
  const validYear = Number.isFinite(year) && year >= 2020 && year <= 2100 ? year : now.getFullYear()
  const validMonth = Number.isFinite(month) && month >= 1 && month <= 12 ? month : now.getMonth() + 1
  const dayParam = sp.d && /^\d{4}-\d{2}-\d{2}$/.test(sp.d) ? sp.d : null

  const days = await getAvailabilityForChefMonth(chefId, validYear, validMonth)
  const [slotsForDay, bookingsOnDay] = dayParam
    ? await Promise.all([
        getTimeSlotsForChefDay(chefId, dayParam),
        getAssignmentsOnDay(chefId, dayParam),
      ])
    : [[], []]

  const prevMonth = validMonth === 1 ? { y: validYear - 1, m: 12 } : { y: validYear, m: validMonth - 1 }
  const nextMonth = validMonth === 12 ? { y: validYear + 1, m: 1 } : { y: validYear, m: validMonth + 1 }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-[#1a5f3f] text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <Link href={`/admin/chefs/${chefId}`} className="text-[#FFBC00] hover:underline text-sm mb-2 inline-block">
                ← {chef.name}
              </Link>
              <h1 className="text-2xl font-bold">Chef Availability</h1>
              <p className="text-green-100 text-sm mt-1">{chef.email}</p>
            </div>
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex gap-4 items-center mb-6">
            <Link
              href={`/admin/chefs/${chefId}/availability?y=${prevMonth.y}&m=${prevMonth.m}${dayParam ? `&d=${dayParam}` : ''}`}
              className="px-3 py-1.5 border border-gray-300 rounded text-sm hover:bg-gray-50"
            >
              ← Previous
            </Link>
            <span className="text-gray-600 font-medium">
              {new Date(validYear, validMonth - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}
            </span>
            <Link
              href={`/admin/chefs/${chefId}/availability?y=${nextMonth.y}&m=${nextMonth.m}`}
              className="px-3 py-1.5 border border-gray-300 rounded text-sm hover:bg-gray-50"
            >
              Next →
            </Link>
          </div>

          <AvailabilityCalendar
            chefId={chefId}
            year={validYear}
            month={validMonth}
            days={days}
            chefName={chef.name}
            onSetAvailability={(date, available, note) => setDayAvailabilityAdmin(chefId, date, available, note)}
          />
          {dayParam ? (
            <TimeSlotsDayView
              chefId={chefId}
              date={dayParam}
              slots={slotsForDay}
              bookingsOnDay={bookingsOnDay}
              onAddSlot={async (date, start, end) => addTimeSlotAction(chefId, date, start, end)}
              onUpdateSlot={updateTimeSlotAction}
              onDeleteSlot={deleteTimeSlotAction}
              isAdmin
            />
          ) : (
            <p className="text-sm text-gray-500 mt-6">
              Add <code className="bg-gray-100 px-1 rounded">?d=YYYY-MM-DD</code> to the URL to edit time slots. Bookings on that day are shown.
            </p>
          )}
        </div>
      </main>
    </div>
  )
}
