'use client'

import { useChefOffline } from '@/components/chef/ChefOfflineProvider'
import AvailabilityCalendar from '@/components/AvailabilityCalendar'
import { setDayAvailability } from './actions'
import type { DayAvailability } from '@/lib/chef-availability'

type Props = {
  chefId: string
  year: number
  month: number
  days: DayAvailability[]
  chefName?: string
}

/**
 * Phase 2AH — Wraps AvailabilityCalendar with offline queue for availability toggles.
 */
export default function AvailabilityCalendarOffline({ chefId, year, month, days, chefName }: Props) {
  const offline = useChefOffline()

  const onSetAvailability = async (
    date: string,
    available: boolean,
    note?: string | null
  ): Promise<{ success: boolean; error?: string }> => {
    if (offline && !offline.isOnline) {
      await offline.addToQueue('availability_update', { chefId, date, available, note: note ?? null })
      return { success: true }
    }
    return setDayAvailability(chefId, date, available, note ?? null)
  }

  return (
    <AvailabilityCalendar
      chefId={chefId}
      year={year}
      month={month}
      days={days}
      chefName={chefName}
      onSetAvailability={onSetAvailability}
    />
  )
}
