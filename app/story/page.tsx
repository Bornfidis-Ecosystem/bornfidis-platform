import Link from 'next/link'

export default function StoryPage() {
  return (
    <div className="bg-white">
      {/* Header */}
      <header className="bg-[#1a5f3f] text-white py-16">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h1 className="text-5xl font-bold mb-4">Our Story</h1>
          <div className="h-1 w-32 bg-[#FFBC00] mx-auto mb-6"></div>
          <p className="text-green-100 text-lg max-w-2xl mx-auto">
            From a vision to a movement—the story of Bornfidis Provisions.
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="prose prose-lg max-w-none">
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-forestDark mb-4">The Beginning</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Bornfidis Provisions was born from a simple but profound vision: what if every meal
              could regenerate the land, empower communities, and build generational wealth?
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              We started with a question: How can we create a food system that honors God's creation,
              supports local farmers, and nourishes communities in body and spirit?
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-bold text-forestDark mb-4">The Vision</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Our vision is to build a regenerative food system that:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mb-4">
              <li>Restores soil health through regenerative agriculture</li>
              <li>Empowers farmers with fair prices and sustainable practices</li>
              <li>Nourishes communities with faith-anchored meals</li>
              <li>Trains disciples in regenerative practices and enterprise</li>
              <li>Builds generational wealth through community ownership</li>
              <li>Replicates globally to transform food systems worldwide</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-bold text-forestDark mb-4">The Movement</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Today, Bornfidis is more than a catering service—it's a movement. We're building a
              network of regenerative hubs, training leaders, and creating systems that will last
              for generations.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              Every meal we serve, every farmer we support, every community we serve—it's all part
              of a larger story of regeneration, faith, and hope.
            </p>
          </section>

          <section className="bg-[#f0fdf4] p-8 rounded-lg border border-[#d1fae5] mb-12">
            <h2 className="text-2xl font-bold text-forestDark mb-4">Join Us</h2>
            <p className="text-gray-700 leading-relaxed mb-6">
              Be part of the story. Whether you're hosting an event, joining as a chef or farmer,
              or investing in impact, there's a place for you in the Bornfidis movement.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/book"
                className="px-6 py-3 bg-[#FFBC00] text-forestDark rounded-lg font-semibold hover:bg-gold-dark transition"
              >
                Book Your Event
              </Link>
              <Link
                href="/testament"
                className="px-6 py-3 bg-[#1a5f3f] text-white rounded-lg font-semibold hover:bg-[#154a32] transition"
              >
                Read Our Covenant
              </Link>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}

