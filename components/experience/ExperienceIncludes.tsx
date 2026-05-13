import { PageContainer } from '@/components/ui/PageContainer'

const ITEMS = [
  'Chef-Crafted Custom Menu',
  'On-Site Preparation',
  'Premium Plating & Presentation',
  'Seamless Service Flow',
  'Elevated Dining Atmosphere',
] as const

export function ExperienceIncludes() {
  return (
    <section className="py-16 md:py-20" style={{ background: '#0a1210' }}>
      <PageContainer>
        <h2 className="font-display text-2xl text-cream md:text-3xl">What&apos;s included</h2>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {ITEMS.map((t) => (
            <li
              key={t}
              className="rounded-sm border border-brass/20 bg-midnight/50 px-4 py-4 text-center text-sm font-medium text-cream/90"
            >
              <span className="mb-2 block text-brass" aria-hidden>
                ✦
              </span>
              {t}
            </li>
          ))}
        </ul>
      </PageContainer>
    </section>
  )
}
