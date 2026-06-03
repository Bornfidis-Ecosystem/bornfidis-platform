import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { TrustStrip } from '@/components/ui/TrustStrip'

export const dynamic = 'force-dynamic'

/**
 * Marketplace — Commerce Engine hub.
 * Connects producers, service providers, and buyers. Transactional tone.
 */
export default function MarketplacePage() {
  return (
    <main className="min-h-screen bg-card">
      {/* Hero — strong forest background, high-contrast text */}
      <section className="bg-forest text-white py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Marketplace</h1>
          <p className="text-xl text-gold mb-4">Buy. Sell. Supply. Distribute.</p>
          <p className="text-white/80 max-w-2xl mx-auto mb-4">
            A structured network connecting producers, service providers, and buyers through
            organized systems and verified operations.
          </p>
          <p className="text-white/70 text-sm font-medium mb-8">
            Structured intake. Verified operations. Coordinated fulfillment.
          </p>
          <div className="flex flex-wrap justify-center gap-8">
            <div className="flex flex-col items-center gap-1">
              <Button
                href="/farmers"
                variant="primary"
                className="px-6 py-3 bg-gold text-forest hover:bg-gold/90"
              >
                Browse Producers
              </Button>
              <span className="text-white/70 text-xs">Explore verified supply partners.</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Link
                href="/chef/apply"
                className="inline-flex items-center justify-center font-semibold rounded-xl px-6 py-3 border-2 border-gold text-gold hover:bg-gold/10 transition duration-200"
              >
                Become a Vendor
              </Link>
              <span className="text-white/70 text-xs">Apply to join the network.</span>
            </div>
          </div>
          <TrustStrip
            items={['Structured Vetting', 'Coordinated Fulfillment', 'Network Expansion']}
            variant="light"
            className="mt-10"
          />
        </div>
      </section>

      {/* Section divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-goldAccent/40 to-transparent" aria-hidden />

      {/* Who It's For — 3 cards */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-forest mb-8 text-center">Who It&apos;s For</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <Card>
            <h3 className="text-xl font-bold text-forest mb-2">Producers</h3>
            <p className="text-gray-600 text-sm mb-4">
              Farmers, food processors, and manufacturers supplying goods.
            </p>
            <Button href="/farm/apply" variant="primary" className="text-sm px-4 py-2">
              Apply as Producer
            </Button>
          </Card>
          <Card>
            <h3 className="text-xl font-bold text-forest mb-2">Service Providers</h3>
            <p className="text-gray-600 text-sm mb-4">
              Cleaning, logistics, fulfillment, coordination.
            </p>
            <Button href="/chef/apply" variant="primary" className="text-sm px-4 py-2">
              Join Service Network
            </Button>
          </Card>
          <Card>
            <h3 className="text-xl font-bold text-forest mb-2">Buyers</h3>
            <p className="text-gray-600 text-sm mb-4">
              Restaurants, villas, cooperatives, resellers.
            </p>
            <Button href="/academy" variant="primary" className="text-sm px-4 py-2">
              Browse Supply
            </Button>
          </Card>
        </div>
      </section>

      {/* How It Works — 3 steps */}
      <section className="bg-white py-16 px-4 border-t border-gray-200">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-forest mb-10 text-center">How It Works</h2>
          <ol className="grid md:grid-cols-3 gap-8">
            <li className="text-center">
              <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-forest text-goldAccent font-bold mb-3">1</span>
              <h3 className="font-bold text-forest mb-2">Apply & Verify</h3>
              <p className="text-sm text-gray-600">Submit your profile. We verify and onboard.</p>
            </li>
            <li className="text-center">
              <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-forest text-goldAccent font-bold mb-3">2</span>
              <h3 className="font-bold text-forest mb-2">List Products / Services</h3>
              <p className="text-sm text-gray-600">Add what you offer. Buyers discover you.</p>
            </li>
            <li className="text-center">
              <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-forest text-goldAccent font-bold mb-3">3</span>
              <h3 className="font-bold text-forest mb-2">Connect & Fulfill</h3>
              <p className="text-sm text-gray-600">Match, transact, and deliver.</p>
            </li>
          </ol>
        </div>
      </section>

      {/* Current Availability */}
      <section className="max-w-2xl mx-auto px-6 py-16 text-center">
        <div className="rounded-2xl border-2 border-goldAccent bg-card p-6">
          <p className="text-forest font-semibold">Pilot Network Active — Expanding Access</p>
          <p className="text-sm text-gray-600 mt-2">
            We are onboarding producers and service providers. Transaction layer coming soon.
          </p>
        </div>
      </section>
    </main>
  )
}

