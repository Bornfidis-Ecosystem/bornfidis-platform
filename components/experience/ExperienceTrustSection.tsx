import { PageContainer } from '@/components/ui/PageContainer'
import { bookBody, bookHeadline, bookSection } from '@/components/booking/book-culinary-classes'

export function ExperienceTrustSection() {
  return (
    <section className={bookSection}>
      <PageContainer wide>
        <div className="mx-auto max-w-3xl space-y-4 text-center md:text-left">
          <h2 className={`${bookHeadline} text-2xl md:text-3xl`}>Built on consistency and precision</h2>
          <p className={bookBody}>
            Bornfidis Provisions is built on consistency, precision, and attention to detail.
          </p>
          <p className={bookBody}>Each experience is crafted to feel effortless, refined, and memorable.</p>
        </div>
      </PageContainer>
    </section>
  )
}
