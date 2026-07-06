import { PageContainer } from '@/components/ui/PageContainer'
import { bookHeadline, bookSection } from '@/components/booking/book-culinary-classes'

const ITEMS = [
  'Chef-Crafted Custom Menu',
  'On-Site Preparation',
  'Premium Plating & Presentation',
  'Seamless Service Flow',
  'Elevated Dining Atmosphere',
] as const

export function ExperienceIncludes() {
  return (
    <section className={bookSection}>
      <PageContainer wide>
        <h2 className={`${bookHeadline} text-2xl md:text-3xl`}>What&apos;s included</h2>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {ITEMS.map((t) => (
            <li
              key={t}
              className="rounded-none border border-[#ffbc00]/35 bg-[#faf6f0] px-4 py-4 text-center font-sans text-sm text-[#1a1a1a] shadow-none"
            >
              <span className="mb-2 block text-[#ffbc00]" aria-hidden>
                —
              </span>
              {t}
            </li>
          ))}
        </ul>
      </PageContainer>
    </section>
  )
}
