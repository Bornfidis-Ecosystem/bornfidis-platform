import type { Metadata } from 'next'
import { LeadMagnetSaucesForm } from '@/components/guide/LeadMagnetSaucesForm'

export const metadata: Metadata = {
  title: 'Free Guide: 5 Caribbean Sauces | Bornfidis Academy',
  description:
    'Traditional flavors, professional techniques, and the chef secrets behind the Caribbean\'s most essential condiments. Free PDF guide by Brian Maylor.',
}

const BENEFITS = [
  'Learn the flavor foundations behind Caribbean cooking',
  'Master 5 versatile sauces for meats, seafood, and vegetables',
  'Get chef-level tips you can use in your kitchen today',
]

export default function GuideFiveCaribbeanSaucesPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-16 md:py-20">
      <header className="mb-12 text-center">
        <p className="text-forest text-sm font-medium uppercase tracking-wide mb-2">
          Free guide · Bornfidis Academy
        </p>
        <h1 className="text-3xl md:text-4xl font-bold text-navy mb-4">
          5 Caribbean Sauces Every Home Cook Should Know
        </h1>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Traditional flavors, professional techniques, and the chef secrets behind the
          Caribbean&apos;s most essential condiments.
        </p>
        <ul className="mt-6 text-left max-w-md mx-auto space-y-3 text-gray-700">
          {BENEFITS.map((benefit) => (
            <li key={benefit} className="flex items-start gap-3">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-forest/20 flex items-center justify-center mt-0.5" aria-hidden>
                <span className="w-1.5 h-1.5 rounded-full bg-forest" />
              </span>
              <span>{benefit}</span>
            </li>
          ))}
        </ul>
        <p className="text-gray-500 text-sm mt-6">By Brian Maylor · Founder & Executive Chef, Bornfidis</p>
      </header>

      {/* PDF guide preview mockup */}
      <section className="mb-12" aria-hidden>
        <div className="max-w-sm mx-auto rounded-xl border-2 border-forest/20 bg-white shadow-lg overflow-hidden">
          <div className="bg-navy px-4 py-3 text-center">
            <p className="text-goldAccent text-xs font-semibold uppercase tracking-wider">Free PDF Guide</p>
          </div>
          <div className="p-5 space-y-1 text-navy">
            <p className="font-semibold text-sm">5 Caribbean Sauces Every Home Cook Should Know</p>
            <ul className="text-xs text-gray-600 pt-2 space-y-1 border-t border-gray-100 mt-3">
              <li>1. Jamaican Jerk Marinade</li>
              <li>2. Scotch Bonnet Pepper Sauce</li>
              <li>3. Tamarind Glaze</li>
              <li>4. Coconut Curry Sauce</li>
              <li>5. Mango Habanero Sauce</li>
            </ul>
          </div>
        </div>
      </section>

      <LeadMagnetSaucesForm />

      <p className="text-center text-sm text-gray-500 mt-10">
        <a href="/academy" className="text-forest hover:underline">
          Explore Academy courses
        </a>
      </p>
    </main>
  )
}
