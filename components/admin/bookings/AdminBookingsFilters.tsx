import Link from 'next/link'

const QUICK_QUEUES: { href: string; label: string }[] = [
  { href: '/admin/bookings?status=confirmed', label: 'Confirmed' },
  { href: '/admin/bookings?status=completed', label: 'Completed' },
  { href: '/admin/bookings?prep=incomplete&upcoming=7', label: 'Prep incomplete · 7d' },
  { href: '/admin/bookings?upcoming=7', label: 'Upcoming · 7d' },
  { href: '/admin/bookings?deposit=pending', label: 'Deposit pending' },
  { href: '/admin/bookings?balance=pending', label: 'Balance pending' },
  { href: '/admin/bookings?testimonial=needed', label: 'Testimonial follow-up' },
]

export function AdminBookingsFilters() {
  return (
    <div className="border-b border-culinary-outline bg-culinary-bone">
      <div className="container mx-auto px-4 py-stack-sm">
        <p className="mb-stack-sm font-culinary-sans text-label-caps text-culinary-text-muted">Quick queues</p>
        <div className="flex flex-wrap gap-2">
          {QUICK_QUEUES.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="inline-flex items-center rounded-none border border-culinary-outline bg-culinary-bone px-3 py-1 font-culinary-sans text-body-md font-medium text-culinary-navy transition refined hover:border-culinary-navy hover:bg-culinary-surface-low"
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
