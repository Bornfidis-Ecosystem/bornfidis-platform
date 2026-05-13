import { PageContainer } from '@/components/ui/PageContainer'
import { PrimaryButton } from '@/components/ui/PrimaryButton'

export function BookingFinalCta() {
  return (
    <section className="border-t border-brass/20 py-20 md:py-28" style={{ background: 'linear-gradient(180deg, #0F3D2E 0%, #0a1210 100%)' }}>
      <PageContainer className="text-center">
        <h2 className="font-display text-[clamp(1.75rem,4vw,2.5rem)] text-cream">Let&apos;s Create Something Memorable</h2>
        <p className="mx-auto mt-4 max-w-xl text-cream/75">Tell us about your table — we will take it from there.</p>
        <div className="mt-8 flex justify-center">
          <PrimaryButton href="#booking-form" className="min-w-[220px]">
            Submit Your Inquiry
          </PrimaryButton>
        </div>
      </PageContainer>
    </section>
  )
}
