import { PageContainer } from '@/components/ui/PageContainer'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { bookSection } from '@/components/booking/book-culinary-classes'

const FAQS: { q: string; a: string }[] = [
  {
    q: 'How does the booking process work?',
    a: 'Once you submit your inquiry, we review your event details and prepare a custom menu and proposal. A deposit is required to secure your date.',
  },
  {
    q: 'Is a deposit required?',
    a: 'Yes. A deposit is required to confirm all bookings and secure your event date.',
  },
  {
    q: 'Are menus customizable?',
    a: 'Absolutely. Every experience is tailored to your preferences, dietary needs, and event style.',
  },
  {
    q: 'Do you travel?',
    a: 'Yes. We serve Vermont and the Northeast directly. New Jersey and select destinations by arrangement. Jamaica private dining is partner-led — submit an inquiry and we connect you with our Jamaica team.',
  },
  {
    q: 'When will I receive my quote?',
    a: 'Most proposals are delivered within 24–48 hours after your inquiry is submitted.',
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
