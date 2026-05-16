import { PageContainer } from '@/components/ui/PageContainer'
import { bookSection } from '@/components/booking/book-culinary-classes'

const ITEMS = [
  'Customized Menus',
  'Premium Private Dining',
  'Deposit-Secured Bookings',
  'Vermont & Jamaica Availability',
] as const

export function BookingTrustBar() {
  return (
    <section className={bookSection}>
      <PageContainer wide>
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {ITEMS.map((item) => (
            <li
              key={item}
              className="flex items-center gap-3 border-b border-[#C9A84C]/35 pb-4 font-sans text-sm text-[#2c2c2c] last:border-0 sm:border-0 sm:pb-0"
            >
              <span className="text-[#C9A84C]" aria-hidden>
                —
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </PageContainer>
    </section>
  )
}
