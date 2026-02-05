import Link from 'next/link'

export default function ChefsPage() {
  return (
    <div className="bg-white">
      {/* Header */}
      <header className="bg-[#1a5f3f] text-white py-16">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h1 className="text-5xl font-bold mb-4">Our Chef Network</h1>
          <div className="h-1 w-32 bg-[#FFBC00] mx-auto mb-6"></div>
          <p className="text-green-100 text-lg max-w-2xl mx-auto">
            Skilled chefs serving faith-anchored meals with regenerative ingredients.
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="prose prose-lg max-w-none">
          <section className="mb-12">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <h2 className="text-3xl font-bold text-[#1a5f3f]">Chef Partners</h2>
              <Link
                href="/chefs/leaderboard"
                className="inline-block px-4 py-2 rounded-lg border border-[#1a5f3f] text-[#1a5f3f] font-medium hover:bg-[#1a5f3f] hover:text-white transition"
              >
                View Leaderboard
              </Link>
            </div>
            <p className="text-gray-700 leading-relaxed mb-4">
              Our chef network is made up of skilled culinary professionals who share our vision
              of regenerative food and faith-anchored service. Each chef is trained in regenerative
              cooking practices and committed to using locally sourced, sustainable ingredients.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              Chefs in our network receive fair compensation, ongoing training, and the opportunity
              to build their own culinary legacy while serving communities.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-bold text-[#1a5f3f] mb-4">Become a Chef Partner</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Are you a chef passionate about regenerative food and community service? Join our
              network and be part of a movement that's transforming how we eat, cook, and serve.
            </p>
            <div className="bg-[#f0fdf4] p-6 rounded-lg border border-[#d1fae5] mb-6">
              <h3 className="text-xl font-semibold text-[#1a5f3f] mb-3">What You Get:</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Fair compensation and profit sharing</li>
                <li>Access to regenerative ingredients</li>
                <li>Training in regenerative cooking practices</li>
                <li>Community of like-minded chefs</li>
                <li>Opportunity to build your culinary legacy</li>
              </ul>
            </div>
            <Link
              href="/chef/apply"
              className="inline-block px-8 py-3 bg-[#FFBC00] text-[#1a5f3f] rounded-lg font-semibold hover:bg-gold-dark transition"
            >
              Apply to Become a Chef
            </Link>
          </section>
        </div>
      </main>
    </div>
  )
}
