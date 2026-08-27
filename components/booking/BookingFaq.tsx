import { PageContainer } from '@/components/ui/PageContainer'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { bookSection } from '@/components/booking/book-culinary-classes'

const FAQS: { q: string; a: string }[] = [
  {
    q: 'How does the booking process work?',
    a: 'Once you submit your inquiry, we review the date, location, guest count, occasion, and dietary needs. Your proposal confirms the seasonal menu direction, service format, inclusions, and any separately quoted requirements.',
  },
  {
    q: 'Is a deposit required?',
    a: 'Yes. A 30% deposit secures your date. The remaining balance is due 14 days before service unless your written proposal states otherwise.',
  },
  {
    q: 'Can the menu accommodate dietary needs?',
    a: 'Tell us about allergies and dietary needs during your inquiry. We review them before confirmation and clearly explain what can be safely accommodated within the seasonal experience.',
  },
  {
    q: 'Do you travel?',
    a: 'Yes. Vermont is our core service area, with select Northeast destinations by arrangement. Travel outside the core area is quoted separately. Jamaica private dining is partner-led through our local network.',
  },
  {
    q: 'What is the starting investment?',
    a: "The Chef's Passage begins at $1,200 in Vermont. Specialty rentals, extensive tablescapes, travel outside the core service area, premium ingredient upgrades, and additional staffing are quoted separately.",
  },
  {
    q: 'When will I receive my quote?',
    a: 'We normally respond within one business day. Proposal timing depends on the event details and any special sourcing, staffing, travel, or rental requirements.',
  },
]

export function BookingFaq() {
  return (
    <section className={bookSection}>
      <PageContainer wide>
        <SectionHeading theme="culinary" eyebrow="FAQ" title="Questions, answered" />
        <ul className="mx-auto mt-10 max-w-3xl space-y-6">
          {FAQS.map((item) => (
            <li key={item.q} className="border-b border-[#ffbc00]/35 pb-6 last:border-0 last:pb-0">
              <h3 className="font-display text-lg font-normal text-[#1a1a1a]">{item.q}</h3>
              <p className="mt-2 font-sans text-sm leading-relaxed text-[#1a1a1a]/75">{item.a}</p>
            </li>
          ))}
        </ul>
      </PageContainer>
    </section>
  )
}
