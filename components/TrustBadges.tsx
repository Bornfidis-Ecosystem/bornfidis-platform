'use client'

import { useEffect, useState } from 'react'

/**
 * Phase 2R — Client-facing trust badges.
 * Max 3 badges, tooltip "Verified by Bornfidis", hide section if none.
 * Small icons + short labels. No dates or metrics.
 */

export type TrustBadgeItem = { name: string; icon: string }

type Props = {
  /** Pre-fetched badges (e.g. from portal data). If not provided, pass chefId to fetch. */
  badges?: TrustBadgeItem[]
  /** Chef user id; badges will be fetched from /api/public/chefs/[id]/badges when provided and badges is undefined. */
  chefId?: string
  /** Optional label above the strip (e.g. "Verified by Bornfidis") */
  title?: string
  /** Compact display */
  compact?: boolean
}

function BadgeIcon({ icon }: { icon: string }) {
  switch (icon) {
    case 'certified':
      return (
        <span className="text-amber-600" aria-hidden>
          ★
        </span>
      )
    case 'on_time':
      return (
        <span className="text-emerald-600" aria-hidden>
          ◷
        </span>
      )
    case 'prep_perfect':
      return (
        <span className="text-sky-600" aria-hidden>
          ✓
        </span>
      )
    default:
      return (
        <span className="text-gray-500" aria-hidden>
          •
        </span>
      )
  }
}

export function TrustBadges({ badges: initialBadges, chefId, title, compact }: Props) {
  const [badges, setBadges] = React.useState<TrustBadgeItem[]>(initialBadges ?? [])
  const [loading, setLoading] = React.useState(!!chefId && !initialBadges)

  React.useEffect(() => {
    if (initialBadges) {
      setBadges(initialBadges)
      setLoading(false)
      return
    }
    if (!chefId) {
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    fetch(`/api/public/chefs/${encodeURIComponent(chefId)}/badges`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data: TrustBadgeItem[]) => {
        if (!cancelled) setBadges(Array.isArray(data) ? data.slice(0, 3) : [])
      })
      .catch(() => {
        if (!cancelled) setBadges([])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [chefId, initialBadges])

  if (loading || badges.length === 0) return null

  const tooltip = 'Verified by Bornfidis'

  return (
    <div className={compact ? '' : 'rounded-lg border border-gray-200 bg-white p-3'}>
      {title && (
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
          {title}
        </p>
      )}
      <div
        className="flex flex-wrap gap-2 items-center"
        title={tooltip}
      >
        {badges.slice(0, 3).map((b) => (
          <span
            key={b.name}
            title={tooltip}
            className={`inline-flex items-center gap-1.5 rounded-full bg-gray-50 text-gray-700 border border-gray-200 ${compact ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'}`}
          >
            <BadgeIcon icon={b.icon} />
            <span>{b.name}</span>
          </span>
        ))}
      </div>
    </div>
  )
}
