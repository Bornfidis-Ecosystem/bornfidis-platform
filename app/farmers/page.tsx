import Link from 'next/link'

export default function FarmersPage() {
  return (
    <div className="bg-white">
      {/* Header */}
      <header className="bg-[#1a5f3f] text-white py-16">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h1 className="text-5xl font-bold mb-4">Island Harvest Hub</h1>
          <div className="h-1 w-32 bg-[#FFBC00] mx-auto mb-6"></div>
          <p className="text-green-100 text-lg max-w-2xl mx-auto">
            Our network of regenerative farmers supplying fresh, sustainable ingredients.
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="prose prose-lg max-w-none">
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-forestDark mb-4">Regenerative Farmers</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              The Island Harvest Hub connects Bornfidis with farmers who practice regenerative
              agriculture—methods that heal the land, build soil health, and produce nutrient-dense
              food while supporting biodiversity.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              Our farmers receive fair prices, technical support, and access to a network of
              chefs and communities committed to regenerative food systems.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-bold text-forestDark mb-4">Join the Hub</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Are you a farmer practicing or interested in regenerative agriculture? Join the
              Island Harvest Hub and become part of a network that values your work and supports
              your success.
            </p>
            <div className="bg-[#f0fdf4] p-6 rounded-lg border border-[#d1fae5] mb-6">
              <h3 className="text-xl font-semibold text-forestDark mb-3">What You Get:</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Fair prices for your produce</li>
                <li>Direct connection to chefs and communities</li>
                <li>Technical support for regenerative practices</li>
                <li>Access to training and resources</li>
                <li>Part of a growing regenerative network</li>
              </ul>
            </div>
            <Link
              href="/farm/apply"
              className="inline-block px-8 py-3 bg-[#FFBC00] text-forestDark rounded-lg font-semibold hover:bg-gold-dark transition"
            >
              Apply to Join the Hub
            </Link>
          </section>
        </div>
      </main>
    </div>
  )
}

