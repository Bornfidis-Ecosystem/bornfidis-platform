'use client'

import Link from 'next/link'
import { LivingTestament, CommissionedLeader } from '@/types/testament'

interface PublicTestamentClientProps {
  testamentData: {
    featuredTestimonies: LivingTestament[]
    allTestimonies: LivingTestament[]
    leaders: CommissionedLeader[]
  }
}

export default function PublicTestamentClient({ testamentData }: PublicTestamentClientProps) {
  const { featuredTestimonies, allTestimonies, leaders } = testamentData

  return (
    <div className="space-y-12">
      {/* The Bornfidis Story */}
      <section>
        <h2 className="text-3xl font-bold text-forestDark mb-6 text-center">The Bornfidis Story</h2>
        <div className="bg-[#f0fdf4] p-8 rounded-lg shadow-md border border-[#d1fae5]">
          <p className="text-gray-700 leading-relaxed text-lg mb-4">
            Bornfidis Provisions was born from a vision of regeneration—regenerating the land, regenerating communities,
            and regenerating hearts through faith-anchored food and fellowship.
          </p>
          <p className="text-gray-700 leading-relaxed text-lg mb-4">
            We believe that every meal can be a blessing, every farmer can be empowered, and every community
            can be transformed. Our story is one of faith, hope, and love—rooted in the belief that business
            can be a force for good in the world.
          </p>
          <p className="text-gray-700 leading-relaxed text-lg">
            From our first meal served to our global replication, every step has been guided by prayer,
            scripture, and a commitment to building something that will last for generations.
          </p>
        </div>
      </section>

      {/* Featured Testimonies */}
      {featuredTestimonies.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold text-forestDark mb-6 text-center">Scripture Anchors</h2>
          <div className="space-y-6">
            {featuredTestimonies.map((testimony) => (
              <div key={testimony.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="mb-4">
                  <h3 className="text-xl font-semibold text-forestDark mb-2">{testimony.title}</h3>
                  <p className="text-gold font-semibold italic mb-2">"{testimony.scripture}"</p>
                  {testimony.scripture_text && (
                    <p className="text-gray-700 italic mb-4">{testimony.scripture_text}</p>
                  )}
                </div>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{testimony.testimony}</p>
                {testimony.author_name && (
                  <p className="text-sm text-gray-500 mt-4">— {testimony.author_name}
                    {testimony.author_role && `, ${testimony.author_role}`}
                    {testimony.region && ` (${testimony.region})`}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* The Covenant */}
      <section className="bg-[#1a5f3f] text-white p-8 rounded-lg shadow-md">
        <h2 className="text-3xl font-bold mb-6 text-center">The Covenant</h2>
        <div className="h-1 w-24 bg-[#FFBC00] mx-auto mb-6"></div>
        <div className="space-y-4 text-green-100 leading-relaxed max-w-3xl mx-auto">
          <p>
            We, the Bornfidis community, covenant together before God to:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li><strong className="text-white">Steward the Land:</strong> Practice regenerative agriculture that heals and restores</li>
            <li><strong className="text-white">Honor the Farmer:</strong> Pay fair prices and support regenerative practices</li>
            <li><strong className="text-white">Serve the Community:</strong> Provide faith-anchored meals that nourish body and soul</li>
            <li><strong className="text-white">Train Disciples:</strong> Equip the next generation in regenerative practices and faith</li>
            <li><strong className="text-white">Build Generational Wealth:</strong> Create systems that benefit families for 100+ years</li>
            <li><strong className="text-white">Multiply the Movement:</strong> Replicate the Bornfidis model globally</li>
            <li><strong className="text-white">Anchor in Scripture:</strong> Base all decisions on biblical principles</li>
          </ul>
          <p className="mt-6 italic">
            "Whatever you do, work at it with all your heart, as working for the Lord, not for human masters."
          </p>
          <p className="text-right font-semibold">— Colossians 3:23</p>
        </div>
      </section>

      {/* The Commissioning Wall */}
      {leaders.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold text-forestDark mb-6 text-center">The Commissioning Wall</h2>
          <p className="text-gray-600 text-center mb-6">
            Leaders who have been commissioned and signed the Bornfidis covenant.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {leaders.map((leader) => (
              <div key={leader.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
                {leader.photo_url && (
                  <img
                    src={leader.photo_url}
                    alt={leader.name}
                    className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                  />
                )}
                <h3 className="text-lg font-semibold text-forestDark mb-1">{leader.name}</h3>
                <p className="text-sm text-gray-600 capitalize mb-1">{leader.role}</p>
                <p className="text-xs text-gray-500 mb-3">{leader.region}</p>
                {leader.bio && (
                  <p className="text-sm text-gray-700 mb-3 line-clamp-3">{leader.bio}</p>
                )}
                {leader.commissioning_scripture && (
                  <p className="text-xs text-gold italic mb-2">"{leader.commissioning_scripture}"</p>
                )}
                <p className="text-xs text-gray-500">
                  Commissioned: {new Date(leader.commissioned_at).toLocaleDateString()}
                </p>
                {leader.covenant_signed && (
                  <p className="text-xs text-green-600 mt-2">✓ Covenant Signed</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Join the Movement */}
      <section className="bg-[#FFBC00] p-8 rounded-lg shadow-md text-center">
        <h2 className="text-3xl font-bold text-forestDark mb-4">Join the Movement</h2>
        <p className="text-forestDark mb-6 max-w-2xl mx-auto">
          Be part of a movement that's regenerating the land, empowering communities, and building
          generational wealth through faith-anchored practices.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link
            href="/book"
            className="px-6 py-3 bg-[#1a5f3f] text-white rounded-lg font-semibold hover:bg-[#154a32] transition"
          >
            Book Your Event
          </Link>
          <Link
            href="/replicate/apply-leader"
            className="px-6 py-3 bg-white text-forestDark rounded-lg font-semibold hover:bg-gray-100 transition"
          >
            Launch a Region
          </Link>
          <Link
            href="/replicate/invest"
            className="px-6 py-3 bg-white text-forestDark rounded-lg font-semibold hover:bg-gray-100 transition"
          >
            Invest in Impact
          </Link>
          <Link
            href="/housing"
            className="px-6 py-3 bg-white text-forestDark rounded-lg font-semibold hover:bg-gray-100 transition"
          >
            Apply for Housing
          </Link>
        </div>
      </section>

      {/* All Testimonies */}
      {allTestimonies.length > featuredTestimonies.length && (
        <section>
          <h2 className="text-2xl font-bold text-forestDark mb-6 text-center">More Testimonies</h2>
          <div className="space-y-4">
            {allTestimonies
              .filter(t => !t.is_featured)
              .map((testimony) => (
                <div key={testimony.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                  <h3 className="font-semibold text-forestDark mb-1">{testimony.title}</h3>
                  <p className="text-sm text-gold italic mb-2">"{testimony.scripture}"</p>
                  <p className="text-sm text-gray-700 line-clamp-2">{testimony.testimony}</p>
                  {testimony.author_name && (
                    <p className="text-xs text-gray-500 mt-2">— {testimony.author_name}</p>
                  )}
                </div>
              ))}
          </div>
        </section>
      )}
    </div>
  )
}

