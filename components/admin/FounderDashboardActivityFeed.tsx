'use client'

import { useEffect, useState } from 'react'

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
  EMAIL_SUBSCRIBER: '#3B6D11',
  BOOKING_LEAD: '#002747',
  ACADEMY_PURCHASE: '#534AB7',
  SPORTSWEAR_ORDER: '#CE472E',
  FARMER_SIGNUP: '#3B6D11',
  ADMIN_LOG: '#64748b',
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
        <li className="text-sm text-stone-500 italic">No events yet.</li>
      ) : (
        activity.map((item) => (
          <li
            key={item.id}
            className="flex items-start gap-3 text-sm border-b border-stone-100 last:border-0 pb-3 last:pb-0"
          >
            <span
              className="mt-1.5 w-3 h-3 rounded-full shrink-0 flex-shrink-0"
              style={{
                backgroundColor: EVENT_COLORS[item.type] ?? '#64748b',
              }}
              aria-hidden
            />
            <div className="min-w-0 flex-1">
              <p className="font-medium text-stone-900">{item.title}</p>
              <p className="text-stone-600 mt-0.5">{item.description}</p>
              <p className="text-stone-400 text-xs mt-1 tabular-nums">
                {getRelativeTime(item.createdAt)}
              </p>
            </div>
          </li>
        ))
      )}
    </ul>
  )
}
