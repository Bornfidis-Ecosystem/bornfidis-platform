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
    <div className="border-b border-stone-200 bg-white">
      <div className="container mx-auto px-4 py-3">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-500 mb-2">Quick queues</p>
        <div className="flex flex-wrap gap-2">
          {QUICK_QUEUES.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="inline-flex items-center rounded-full border border-navy/15 bg-stone-50 px-3 py-1 text-xs font-medium text-navy hover:bg-navy hover:text-white transition"
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
