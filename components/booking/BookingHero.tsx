import Image from 'next/image'

import { bornfidisPhotos } from '@/lib/bornfidis-photos'
import { PHASE1_CTA } from '@/lib/phase1-marketing'
import { PageContainer } from '@/components/ui/PageContainer'
import { PrimaryButton } from '@/components/ui/PrimaryButton'
import { SecondaryButton } from '@/components/ui/SecondaryButton'
import { bookBody, bookEyebrow, bookHeadline } from '@/components/booking/book-culinary-classes'

export function BookingHero() {
  return (
    <section className="border-b border-[#ffbc00]/35 pt-24 md:pt-28">
      <PageContainer wide as="div" className="pb-16 pt-12 md:pb-20 md:pt-16">
        <div className="grid items-stretch gap-10 lg:grid-cols-2 lg:gap-16">
          {/* Left — copy */}
          <div className="flex flex-col justify-center text-center lg:text-left">
            <p className={bookEyebrow}>Bornfidis Provisions</p>
            <h1 className={`${bookHeadline} mx-auto max-w-xl text-[clamp(2rem,5vw,3.25rem)] lg:mx-0`}>
              Book Your Private Dining Experience
            </h1>
            <p className={`${bookBody} mx-auto mt-6 max-w-xl lg:mx-0`}>
              Chef-led private dining designed for intimate celebrations, elegant gatherings, and unforgettable
              evenings.
            </p>
            <p className={`${bookBody} mx-auto mt-3 max-w-xl text-sm lg:mx-0`}>
              Serving Vermont now. Jamaica and select travel engagements by advance request.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4 lg:justify-start">
              <PrimaryButton theme="culinary" href="#booking-form" className="w-full min-w-0 sm:min-w-[200px] sm:w-auto">
                {PHASE1_CTA.bookPrivateDining.label}
              </PrimaryButton>
              <SecondaryButton
                theme="culinary"
                href="https://wa.me/18027335348?text=Hi%20Brian%2C%20I%27d%20like%20to%20discuss%20a%20private%20dining%20experience."
                className="w-full sm:w-auto"
                target="_blank"
                rel="noopener noreferrer"
              >
                WhatsApp
              </SecondaryButton>
            </div>
          </div>
          {/* Right — Vermont table photo panel */}
          <div className="relative min-h-[360px] w-full overflow-hidden lg:min-h-[520px]">
            <Image
              src={bornfidisPhotos.table.vermontCabin}
              alt="Private dining table set in a Vermont log cabin, Bornfidis"
              fill
              priority
              className="object-cover object-center"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            <div
              className="absolute inset-0"
              aria-hidden
              style={{
                background:
                  'linear-gradient(to bottom, rgba(26,60,52,0.15), rgba(26,60,52,0.65))',
              }}
            />
          </div>
        </div>
      </PageContainer>
    </section>
  )
}
