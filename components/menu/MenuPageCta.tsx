import { PageContainer } from '@/components/ui/PageContainer'
import { PrimaryButton } from '@/components/ui/PrimaryButton'

export function MenuPageCta() {
  return (
    <section className="border-t border-brass/20 py-16" style={{ background: 'linear-gradient(180deg, #0F3D2E 0%, #0a1210 100%)' }}>
      <PageContainer className="text-center">
        <p className="text-cream/80">Ready to plan a table that matches the moment?</p>
        <div className="mt-6 flex justify-center">
          <PrimaryButton href="/book" className="min-w-[200px]">
            Book Your Experience
          </PrimaryButton>
        </div>
      </PageContainer>
    </section>
  )
}
