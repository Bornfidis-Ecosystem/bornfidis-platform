import { PageContainer } from '@/components/ui/PageContainer'

export function ExperienceTrustSection() {
  return (
    <section className="py-16 md:py-20" style={{ background: '#0a0f0c' }}>
      <PageContainer>
        <div className="max-w-3xl space-y-4 text-center md:text-left">
          <h2 className="font-display text-2xl text-cream md:text-3xl">Built on consistency and precision</h2>
          <p className="text-cream/75">
            Bornfidis Provisions is built on consistency, precision, and attention to detail.
          </p>
          <p className="text-cream/75">
            Each experience is crafted to feel effortless, refined, and memorable.
          </p>
        </div>
      </PageContainer>
    </section>
  )
}
