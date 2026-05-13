import { PageContainer } from '@/components/ui/PageContainer'
import { SectionHeading } from '@/components/ui/SectionHeading'

export function MenuCustomizationNote() {
  return (
    <section className="border-t border-brass/15 py-16 md:py-20" style={{ backgroundColor: '#0a0f0c' }}>
      <PageContainer>
        <SectionHeading
          eyebrow="Service"
          title="Designed Around Your Occasion"
          subtitle="Each menu is created with your preferences, dietary needs, and the nature of your event in mind. From intimate plated dinners to relaxed elevated gatherings, every experience is thoughtfully curated."
        />
      </PageContainer>
    </section>
  )
}
