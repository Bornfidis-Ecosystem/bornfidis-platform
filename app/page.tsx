import Link from 'next/link'
import { FeaturedChefsSection } from '@/components/FeaturedChefsSection'
import { FeaturedAcademySection } from '@/components/academy/FeaturedAcademySection'
import { Button } from '@/components/ui/Button'

export default async function Home() {
  return (
    <>
      {/* Hero — full-width, brand-forward */}
      <section className="w-full bg-forest text-white">
        <div className="max-w-4xl mx-auto px-6 py-20 md:py-28 text-center">
          <div className="h-1 w-16 bg-gold rounded-full mx-auto mb-6" aria-hidden />
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Bornfidis Platform
          </h1>
          <p className="text-xl text-white max-w-xl mx-auto mb-8">
            Regenerating land, people, and enterprise.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button
              href="/academy"
              variant="primary"
              className="px-8 py-3 text-base bg-gold text-forest hover:opacity-90"
            >
              Explore Academy
            </Button>
            <Link
              href="/admin/login"
              className="inline-flex items-center justify-center font-semibold rounded-xl px-8 py-3 text-base border-2 border-gold text-gold hover:bg-gold hover:text-forest transition duration-200 ease-out"
            >
              Enter Platform
            </Link>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div
        className="h-1 w-full bg-gradient-to-r from-transparent via-gold/50 to-transparent"
        aria-hidden
      />

      {/* Main content — light background, clear sections */}
      <section className="w-full bg-card min-h-[40vh]">
        <div className="max-w-6xl mx-auto px-6 py-16 md:py-20">
          <FeaturedChefsSection />
          <FeaturedAcademySection />
          <p className="text-center mt-12 text-gray-600 text-sm">
            <Link href="/story" className="font-medium text-forest hover:underline">
              Our Story
            </Link>
            {' · '}
            <Link href="/book" className="font-medium text-forest hover:underline">
              Book provisions
            </Link>
            {' · '}
            <Link href="/academy" className="font-medium text-forest hover:underline">
              Academy
            </Link>
            {' · '}
            <Link href="/sportswear" className="font-medium text-forest hover:underline">
              Sportswear
            </Link>
          </p>
        </div>
      </section>
    </>
  )
}
