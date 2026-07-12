import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default function PaymentsPage() {
  return (
    <div className="min-h-screen bg-bone">
      {/* Forest green header + gold divider */}
      <header className="bg-navy text-white px-6 py-8 text-center">
        <h1 className="text-2xl font-bold">Payment & Participation</h1>
        <p className="text-lg font-medium mt-1 opacity-95">
          Bornfidis — Pilot Phase
        </p>
        <div className="mt-4 h-0.5 w-16 mx-auto rounded-none bg-gold" />
        <p className="text-lg font-semibold mt-4 text-gold">
          Simple. Transparent. Fair.
        </p>
      </header>

      <main className="max-w-xl mx-auto px-4 py-6 space-y-5">
        {/* Intro card */}
        <section className="rounded-none bg-white p-5 shadow-sm border border-gray-100">
          <p className="text-charcoal">
            Bornfidis is starting small. Payments are handled clearly and
            respectfully, with no pressure and no confusion.
          </p>
        </section>

        {/* Farmers */}
        <section className="rounded-none bg-white p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl" aria-hidden>🌱</span>
            <h2 className="text-lg font-semibold text-charcoal">Farmers</h2>
          </div>
          <ul className="list-disc pl-5 text-sm text-charcoal space-y-1">
            <li>Paid per delivery or supply</li>
            <li>Pricing agreed before anything moves</li>
            <li>Goal: fair, above-market pay for quality & reliability</li>
            <li>Payment timing confirmed upfront</li>
          </ul>
        </section>

        {/* Chefs */}
        <section className="rounded-none bg-white p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl" aria-hidden>🍽️</span>
            <h2 className="text-lg font-semibold text-charcoal">Chefs</h2>
          </div>
          <ul className="list-disc pl-5 text-sm text-charcoal space-y-1">
            <li>Pay only for what you order</li>
            <li>No subscriptions</li>
            <li>No hidden fees</li>
            <li>Clear pricing, direct sourcing</li>
          </ul>
        </section>

        {/* Educators & Coordinators */}
        <section className="rounded-none bg-white p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl" aria-hidden>🎓</span>
            <h2 className="text-lg font-semibold text-charcoal">
              Educators & Coordinators
            </h2>
          </div>
          <ul className="list-disc pl-5 text-sm text-charcoal space-y-1">
            <li>Paid by stipend or per engagement</li>
            <li>Amount agreed before work begins</li>
            <li>No unpaid expectations</li>
          </ul>
        </section>

        {/* Youth & Apprentices */}
        <section className="rounded-none bg-white p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl" aria-hidden>👩🏽‍🌾👨🏽‍🍳</span>
            <h2 className="text-lg font-semibold text-charcoal">
              Youth & Apprentices
            </h2>
          </div>
          <ul className="list-disc pl-5 text-sm text-charcoal space-y-1">
            <li>Paid learning opportunities</li>
            <li>Clear hours</li>
            <li>Clear stipend</li>
            <li>Learning with dignity — not exploitation</li>
          </ul>
        </section>

        {/* Important Boundaries */}
        <section className="rounded-none bg-white p-5 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-charcoal mb-3 flex items-center gap-2">
            <span aria-hidden>🔒</span> Important Boundaries
          </h2>
          <ul className="list-disc pl-5 text-sm text-charcoal space-y-1">
            <li>No &quot;work for exposure&quot;</li>
            <li>No forced participation</li>
            <li>Payment happens only when value is delivered</li>
          </ul>
        </section>

        {/* When Money Is Discussed */}
        <section className="rounded-none bg-white p-5 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-charcoal mb-3 flex items-center gap-2">
            <span aria-hidden>🕊️</span> When Money Is Discussed
          </h2>
          <p className="text-sm text-charcoal mb-2">
            Not at signup. Not in WhatsApp groups. Only when:
          </p>
          <ul className="list-disc pl-5 text-sm text-charcoal space-y-1">
            <li>An opportunity is real</li>
            <li>Details are clear</li>
            <li>Everyone agrees</li>
          </ul>
        </section>

        {/* Our Principle */}
        <section className="rounded-none bg-white p-5 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-charcoal mb-2 flex items-center gap-2">
            <span aria-hidden>🌿</span> Our Principle
          </h2>
          <p className="text-charcoal">
            Bornfidis moves at the speed of trust. We start small, do things
            properly, and grow from there.
          </p>
        </section>

        <p className="text-center pt-4">
          <Link
            href="/"
            className="text-sm font-medium text-gray-600 hover:text-charcoal underline"
          >
            Back to Home
          </Link>
        </p>
      </main>
    </div>
  )
}
