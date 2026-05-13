import { PageContainer } from '@/components/ui/PageContainer'

const ITEMS = [
  'Customized Menus',
  'Premium Private Dining',
  'Deposit-Secured Bookings',
  'Vermont & Jamaica Availability',
] as const

export function BookingTrustBar() {
  return (
    <section className="border-t border-brass/20 bg-midnight/60 py-8">
      <PageContainer>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {ITEMS.map((item) => (
            <li
              key={item}
              className="flex items-center gap-2 border-b border-brass/10 pb-3 text-sm text-cream/85 last:border-0 sm:border-0 sm:pb-0"
            >
              <span className="text-brass" aria-hidden>
                ✦
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </PageContainer>
    </section>
  )
}
