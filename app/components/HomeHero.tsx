import Link from 'next/link'

export default function HomeHero() {
  return (
    <section className="relative bg-gradient-to-br from-[#1a5f3f] to-[#154a32] text-white py-20 md:py-32">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            Regenerating Land,<br />
            People & Enterprise
          </h1>
          <div className="h-2 w-32 bg-[#FFBC00] mx-auto mb-8"></div>
          <p className="text-xl md:text-2xl text-green-100 mb-8 leading-relaxed">
            Faith-anchored food and fellowship that heals the land, empowers communities,
            and builds generational wealth.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/book"
              className="px-8 py-4 bg-[#FFBC00] text-forestDark rounded-lg font-semibold text-lg hover:bg-gold-dark transition shadow-lg"
            >
              Book Your Event
            </Link>
            <Link
              href="/story"
              className="px-8 py-4 bg-white text-forestDark rounded-lg font-semibold text-lg hover:bg-gray-100 transition shadow-lg"
            >
              Our Story
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

