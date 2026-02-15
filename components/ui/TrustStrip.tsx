'use client'

const DEFAULT_ITEMS = [
  'Secure Checkout',
  'Instant Digital Access',
  'Verified Systems',
]

interface TrustStripProps {
  items?: string[]
  className?: string
  /** Light text for use on dark backgrounds (e.g. forest hero) */
  variant?: 'default' | 'light'
}

export function TrustStrip({
  items = DEFAULT_ITEMS,
  className = '',
  variant = 'default',
}: TrustStripProps) {
  const textClass = variant === 'light' ? 'text-white/80' : 'text-forest/80'
  const checkClass = variant === 'light' ? 'text-gold' : 'text-goldAccent'

  return (
    <ul
      className={`flex flex-wrap justify-center gap-x-8 gap-y-2 text-sm ${textClass} ${className}`}
      role="list"
    >
      {items.map((label) => (
        <li key={label} className="flex items-center gap-2">
          <span className={checkClass} aria-hidden>
            ✓
          </span>
          {label}
        </li>
      ))}
    </ul>
  )
}
