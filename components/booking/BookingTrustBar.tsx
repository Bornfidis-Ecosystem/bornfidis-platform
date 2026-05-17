import { PageContainer } from '@/components/ui/PageContainer'
import { bookEyebrow, bookHeadline, bookSection } from '@/components/booking/book-culinary-classes'

const ITEMS = [
  'Customized menus written for your table',
  'Premium private dining — chef-led from arrival to last course',
  'Deposit-secured bookings with clear communication',
  'Named sourcing — every key ingredient traced to a farm or fisherman',
] as const

export function BookingTrustBar() {
  return (
    <section className={bookSection} aria-labelledby="booking-trust-heading">
      <PageContainer wide>
        <p className={`${bookEyebrow} text-center`}>Trust</p>
        <h2 id="booking-trust-heading" className={`${bookHeadline} mt-4 text-center text-2xl md:text-3xl`}>
          Why hosts trust Bornfidis
        </h2>
        <ul className="mt-10 grid gap-6 sm:grid-cols-2">
          {ITEMS.map((item) => (
            <li
              key={item}
              className="flex gap-3 border-b border-[#C9A84C]/35 pb-5 font-sans text-sm font-light leading-relaxed tracking-wide text-[#2c2c2c] last:border-0 sm:border-0 sm:pb-0"
            >
              <span className="mt-0.5 shrink-0 text-[#C9A84C]" aria-hidden>
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
