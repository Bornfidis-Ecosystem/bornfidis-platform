'use client'

import { useState, useEffect } from 'react'
import { setDayAvailability } from './actions'
import { useChefOffline } from '@/components/chef/ChefOfflineProvider'

type DayInfo = {
  date: string
  available: boolean
  hasAssignment: boolean
  label: string
}

type Props = {
  chefId: string
  days: DayInfo[]
}

/**
 * Phase 2AE — One-tap availability for this week. Busy (has booking) is read-only.
 * Phase 2AH — Offline: queue availability toggles, sync when back online.
 */
export function AvailabilityWeekStrip({ chefId, days }: Props) {
  const [saving, setSaving] = useState<string | null>(null)
  const [localDays, setLocalDays] = useState(days)
  const offline = useChefOffline()

  useEffect(() => {
    setLocalDays(days)
  }, [days])

  async function handleToggle(date: string, current: boolean) {
    const next = !current
    if (offline && !offline.isOnline) {
      await offline.addToQueue('availability_update', { chefId, date, available: next, note: null })
      setLocalDays((prev) =>
        prev.map((d) => (d.date === date ? { ...d, available: next } : d))
      )
      return
    }
    setSaving(date)
    const res = await setDayAvailability(chefId, date, next, null)
    setSaving(null)
    if (res.success) window.location.reload()
  }

  return (
    <div className="mb-6">
      <p className="text-sm font-semibold text-gray-700 mb-2">This week — one tap</p>
      <div className="flex flex-wrap gap-2">
        {localDays.map((d) => (
          <div
            key={d.date}
            className="flex flex-col items-center rounded-xl border border-gray-200 bg-white p-3 min-w-[72px]"
          >
            <span className="text-xs text-gray-500">{d.label}</span>
            <span className="text-sm font-medium text-gray-900 mt-0.5">
              {new Date(d.date + 'T12:00:00').toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
            </span>
            {d.hasAssignment ? (
              <span className="mt-2 text-xs font-medium text-amber-700">Busy</span>
            ) : (
              <button
                type="button"
                disabled={saving === d.date}
                onClick={() => handleToggle(d.date, d.available)}
                aria-label={d.available ? 'Set unavailable' : 'Set available'}
                className={`mt-2 min-h-[44px] min-w-[44px] rounded-lg px-3 py-2 text-sm font-medium touch-manipulation ${
                  d.available
                    ? 'bg-[#1a5f3f] text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                {saving === d.date ? '…' : d.available ? 'On' : 'Off'}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
