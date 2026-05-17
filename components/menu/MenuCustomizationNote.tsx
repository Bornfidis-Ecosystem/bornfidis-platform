import { PageContainer } from '@/components/ui/PageContainer'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { bookSection } from '@/components/booking/book-culinary-classes'

export function MenuCustomizationNote() {
  return (
    <section className={bookSection}>
      <PageContainer wide>
        <SectionHeading
          theme="culinary"
          eyebrow="Service"
          title="Designed Around Your Occasion"
          subtitle="Each menu is created with your preferences, dietary needs, and the nature of your event in mind. From intimate plated dinners to relaxed elevated gatherings, every experience is thoughtfully curated."
        />
      </PageContainer>
    </section>
  )
}
