import Image from 'next/image'
import { PageContainer } from '@/components/ui/PageContainer'
import { PrimaryButton } from '@/components/ui/PrimaryButton'
import { SecondaryButton } from '@/components/ui/SecondaryButton'
import { bookImages } from '@/lib/book-images'

export function BookingHero() {
  return (
    <section className="relative isolate min-h-[min(100vh,880px)] overflow-hidden pt-24">
      <div className="absolute inset-0 z-0">
        <Image
          src={bookImages.hero}
          alt=""
          fill
          priority
          className="object-cover object-[center_30%]"
          sizes="100vw"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to bottom, rgba(8,8,8,0.78) 0%, rgba(8,8,8,0.4) 45%, rgba(8,8,8,0.92) 100%)',
          }}
        />
      </div>
      <PageContainer as="div" className="relative z-[1] pb-24 pt-12 md:pb-28 md:pt-16">
        <p className="mb-4 text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-brass">Bornfidis Provisions</p>
        <h1 className="font-display text-[clamp(2.25rem,6vw,3.75rem)] leading-[1.05] tracking-tight text-cream">
          Book Your Private Dining Experience
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-relaxed text-cream/80 md:text-lg">
          Chef-led private dining designed for intimate celebrations, elegant gatherings, and unforgettable
          evenings.
        </p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <PrimaryButton href="#booking-form" className="w-full min-w-[200px] sm:w-auto">
            Request Your Experience
          </PrimaryButton>
          <SecondaryButton
            href="https://wa.me/18027335348?text=Hi%20Brian%2C%20I%27d%20like%20to%20discuss%20a%20private%20dining%20experience."
            className="w-full sm:w-auto"
            target="_blank"
            rel="noopener noreferrer"
          >
            WhatsApp
          </SecondaryButton>
        </div>
      </PageContainer>
    </section>
  )
}
