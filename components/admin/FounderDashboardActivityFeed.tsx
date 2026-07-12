'use client'

import { useEffect, useState } from 'react'
import { brand, chartColors } from '@/lib/design-tokens'

const POLL_MS = 30_000

export interface ActivityEvent {
  id: string
  type: string
  title: string
  description: string
  division: string
  createdAt: string
  metadata?: Record<string, unknown>
}

const EVENT_COLORS: Record<string, string> = {
  EMAIL_SUBSCRIBER: chartColors.conversion,
  BOOKING_LEAD: chartColors.bookings,
  ACADEMY_PURCHASE: chartColors.academy,
  SPORTSWEAR_ORDER: chartColors.sportswear,
  FARMER_SIGNUP: chartColors.proju,
  ADMIN_LOG: brand.muted,
}

function getRelativeTime(iso: string): string {
  const d = new Date(iso)
  const now = new Date()
  const sec = Math.floor((now.getTime() - d.getTime()) / 1000)
  if (sec < 60) return 'Just now'
  const min = Math.floor(sec / 60)
  if (min < 60) return `${min} minute${min === 1 ? '' : 's'} ago`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr} hour${hr === 1 ? '' : 's'} ago`
  const day = Math.floor(hr / 24)
  if (day === 1) return 'Yesterday'
  if (day < 7) return `${day} days ago`
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function FounderDashboardActivityFeed({
  initialActivity,
}: {
  initialActivity: ActivityEvent[]
}) {
  const [activity, setActivity] = useState<ActivityEvent[]>(initialActivity)

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const res = await fetch('/api/admin/activity')
        if (res.ok) {
          const data = await res.json()
          setActivity(data)
        }
      } catch {
        // keep previous state on error
      }
    }
    const t = setInterval(fetchActivity, POLL_MS)
    return () => clearInterval(t)
  }, [])

  return (
    <ul className="space-y-3">
      {activity.length === 0 ? (
        <li className="font-culinary-sans text-sm italic text-culinary-text-muted">No events yet.</li>
      ) : (
        activity.map((item) => (
          <li
            key={item.id}
            className="flex items-start gap-3 border-b border-culinary-outline pb-3 font-culinary-sans text-sm last:border-0 last:pb-0"
          >
            <span
              className="mt-1.5 h-3 w-3 shrink-0 rounded-none"
              style={{
                backgroundColor: EVENT_COLORS[item.type] ?? '#64748b',
              }}
              aria-hidden
            />
            <div className="min-w-0 flex-1">
              <p className="font-medium text-culinary-ink">{item.title}</p>
              <p className="mt-0.5 text-culinary-text-muted">{item.description}</p>
              <p className="mt-1 font-culinary-sans text-xs tabular-nums text-culinary-text-muted">
                {getRelativeTime(item.createdAt)}
              </p>
            </div>
          </li>
        ))
      )}
    </ul>
  )
}
