import { PageContainer } from '@/components/ui/PageContainer'
import { PrimaryButton } from '@/components/ui/PrimaryButton'

export function ExperiencePageCta() {
  return (
    <section
      className="border-t border-brass/20 py-20"
      style={{ background: 'linear-gradient(180deg, #0F3D2E 0%, #080a09 100%)' }}
    >
      <PageContainer className="text-center">
        <h2 className="font-display text-2xl text-cream">Ready to begin?</h2>
        <div className="mt-8 flex justify-center">
          <PrimaryButton href="/book" className="min-w-[200px]">
            Book Your Experience
          </PrimaryButton>
        </div>
      </PageContainer>
    </section>
  )
}
