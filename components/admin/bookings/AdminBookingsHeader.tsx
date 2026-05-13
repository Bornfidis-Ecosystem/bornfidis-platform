import type { ReactNode } from 'react'

export function AdminBookingsHeader({
  title = 'Bookings',
  subtext = 'Track inquiries, quotes, deposits, and confirmed events.',
  actions,
}: {
  title?: string
  subtext?: string
  actions?: ReactNode
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0">
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-gold text-sm mt-1">{subtext}</p>
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-3">{actions}</div> : null}
    </div>
  )
}
