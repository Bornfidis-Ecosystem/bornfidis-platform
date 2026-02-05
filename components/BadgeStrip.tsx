'use client'

/**
 * Phase 2P — Badge strip: icon + label, tooltip with criteria.
 * Shows earned badges only (read-only).
 */

export type BadgeItem = {
  id: string
  name: string
  criteria: string
  awardedAt: Date | string
}

type Props = {
  badges: BadgeItem[]
  /** Optional title above the strip */
  title?: string
  /** Compact = smaller labels */
  compact?: boolean
}

export function BadgeStrip({ badges, title, compact }: Props) {
  if (badges.length === 0) return null

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3">
      {title && (
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
          {title}
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        {badges.map((b) => (
          <span
            key={b.id}
            title={b.criteria}
            className={`inline-flex items-center gap-1.5 rounded-full bg-green-50 text-green-800 border border-green-200 ${compact ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'}`}
          >
            <span className="text-green-600" aria-hidden>✓</span>
            <span>{b.name}</span>
          </span>
        ))}
      </div>
    </div>
  )
}
