import Link from 'next/link'

export default function LaunchPage() {
  return (
    <div className="bg-white">
      {/* Header */}
      <header className="bg-gradient-to-br from-[#1a5f3f] to-[#154a32] text-white py-20">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-4">We're Launching!</h1>
          <div className="h-1 w-32 bg-[#FFBC00] mx-auto mb-6"></div>
          <p className="text-green-100 text-xl max-w-2xl mx-auto">
            Bornfidis Provisions is officially launching. Join us in regenerating land, people, and enterprise.
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="space-y-16">
          {/* Launch Announcement */}
          <section className="text-center">
            <h2 className="text-4xl font-bold text-[#1a5f3f] mb-6">The Movement Begins</h2>
            <div className="max-w-3xl mx-auto text-lg text-gray-700 leading-relaxed space-y-4">
              <p>
                After years of vision, planning, and building, Bornfidis Provisions is ready to launch
                publicly. We're not just launching a business—we're launching a movement.
              </p>
              <p>
                A movement that regenerates the land through sustainable agriculture. A movement that
                empowers farmers and chefs with fair compensation. A movement that builds generational
                wealth through community ownership. A movement anchored in faith and scripture.
              </p>
              <p className="font-semibold text-[#1a5f3f]">
                This is just the beginning. Join us.
              </p>
            </div>
          </section>

          {/* Call to Action Grid */}
          <section>
            <h2 className="text-3xl font-bold text-[#1a5f3f] mb-8 text-center">Get Involved</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Link
                href="/stories"
                className="bg-white border-2 border-[#1a5f3f] rounded-lg p-6 hover:bg-[#f0fdf4] transition text-center"
              >
                <div className="text-4xl mb-4">📖</div>
                <h3 className="text-xl font-semibold text-[#1a5f3f] mb-2">Share Your Story</h3>
                <p className="text-gray-600">Tell us how Bornfidis has impacted you</p>
              </Link>
              <Link
                href="/documentary"
                className="bg-white border-2 border-[#1a5f3f] rounded-lg p-6 hover:bg-[#f0fdf4] transition text-center"
              >
                <div className="text-4xl mb-4">🎬</div>
                <h3 className="text-xl font-semibold text-[#1a5f3f] mb-2">Watch the Documentary</h3>
                <p className="text-gray-600">See the Bornfidis story come to life</p>
              </Link>
              <Link
                href="/press"
                className="bg-white border-2 border-[#1a5f3f] rounded-lg p-6 hover:bg-[#f0fdf4] transition text-center"
              >
                <div className="text-4xl mb-4">📰</div>
                <h3 className="text-xl font-semibold text-[#1a5f3f] mb-2">Press Kit</h3>
                <p className="text-gray-600">Download media resources</p>
              </Link>
              <Link
                href="/partners"
                className="bg-white border-2 border-[#1a5f3f] rounded-lg p-6 hover:bg-[#f0fdf4] transition text-center"
              >
                <div className="text-4xl mb-4">🤝</div>
                <h3 className="text-xl font-semibold text-[#1a5f3f] mb-2">Partner With Us</h3>
                <p className="text-gray-600">Explore partnership opportunities</p>
              </Link>
              <Link
                href="/book"
                className="bg-[#FFBC00] border-2 border-[#FFBC00] rounded-lg p-6 hover:bg-gold-dark transition text-center"
              >
                <div className="text-4xl mb-4">🍽️</div>
                <h3 className="text-xl font-semibold text-[#1a5f3f] mb-2">Book Your Event</h3>
                <p className="text-[#1a5f3f]">Host a faith-anchored meal</p>
              </Link>
              <Link
                href="/replicate/apply-leader"
                className="bg-white border-2 border-[#1a5f3f] rounded-lg p-6 hover:bg-[#f0fdf4] transition text-center"
              >
                <div className="text-4xl mb-4">🌍</div>
                <h3 className="text-xl font-semibold text-[#1a5f3f] mb-2">Launch a Region</h3>
                <p className="text-gray-600">Bring Bornfidis to your community</p>
              </Link>
            </div>
          </section>

          {/* Launch Timeline */}
          <section className="bg-[#f0fdf4] p-8 rounded-lg border border-[#d1fae5]">
            <h2 className="text-3xl font-bold text-[#1a5f3f] mb-6 text-center">Launch Timeline</h2>
            <div className="max-w-3xl mx-auto space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[#FFBC00] rounded-full flex items-center justify-center font-bold text-[#1a5f3f] flex-shrink-0">
                  1
                </div>
                <div>
                  <h3 className="font-semibold text-[#1a5f3f] mb-1">Public Launch</h3>
                  <p className="text-gray-700">Official public launch of Bornfidis Provisions</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[#FFBC00] rounded-full flex items-center justify-center font-bold text-[#1a5f3f] flex-shrink-0">
                  2
                </div>
                <div>
                  <h3 className="font-semibold text-[#1a5f3f] mb-1">Community Building</h3>
                  <p className="text-gray-700">Growing our network of chefs, farmers, and partners</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[#FFBC00] rounded-full flex items-center justify-center font-bold text-[#1a5f3f] flex-shrink-0">
                  3
                </div>
                <div>
                  <h3 className="font-semibold text-[#1a5f3f] mb-1">Regional Expansion</h3>
                  <p className="text-gray-700">Launching Bornfidis hubs in new regions</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[#FFBC00] rounded-full flex items-center justify-center font-bold text-[#1a5f3f] flex-shrink-0">
                  4
                </div>
                <div>
                  <h3 className="font-semibold text-[#1a5f3f] mb-1">Global Movement</h3>
                  <p className="text-gray-700">Scaling regenerative food systems worldwide</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
