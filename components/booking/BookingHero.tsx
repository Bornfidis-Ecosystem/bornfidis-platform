import Image from 'next/image'
import { PageContainer } from '@/components/ui/PageContainer'
import { PrimaryButton } from '@/components/ui/PrimaryButton'
import { SecondaryButton } from '@/components/ui/SecondaryButton'
import { bookBody, bookEyebrow, bookHeadline } from '@/components/booking/book-culinary-classes'
import { bookImages } from '@/lib/book-images'

export function BookingHero() {
  return (
    <section className="relative isolate overflow-hidden border-b border-[#C9A84C]/35 pt-24 md:pt-28">
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
              'linear-gradient(to bottom, rgba(253,248,248,0.92) 0%, rgba(253,248,248,0.75) 45%, rgba(253,248,248,0.97) 100%)',
          }}
        />
      </div>
      <PageContainer wide as="div" className="relative z-[1] pb-16 pt-12 text-center md:pb-20 md:pt-16">
        <p className={bookEyebrow}>Bornfidis Provisions</p>
        <h1 className={`${bookHeadline} mx-auto max-w-4xl text-[clamp(2rem,5vw,3.25rem)]`}>
          Book Your Private Dining Experience
        </h1>
        <p className={`${bookBody} mx-auto mt-6 max-w-2xl`}>
          Chef-led private dining designed for intimate celebrations, elegant gatherings, and unforgettable
          evenings.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
          <PrimaryButton theme="culinary" href="#booking-form" className="w-full min-w-[200px] sm:w-auto">
            Request Your Experience
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
      </PageContainer>
    </section>
  )
}
