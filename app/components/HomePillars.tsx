import Link from 'next/link'

const pillars = [
  {
    title: 'Food',
    description: 'Regenerative agriculture that heals the land and nourishes communities.',
    icon: '🌾',
    href: '/farmers',
    color: 'from-green-500 to-green-600',
  },
  {
    title: 'Education',
    description: 'Training disciples in regenerative practices and faith-anchored enterprise.',
    icon: '📚',
    href: '/cooperative',
    color: 'from-[#FFBC00] to-[#e6a500]',
  },
  {
    title: 'Clothing',
    description: 'Sustainable textiles and fair-trade fashion (coming soon).',
    icon: '👕',
    href: '#',
    color: 'from-blue-500 to-blue-600',
  },
  {
    title: 'Housing',
    description: 'Community-owned housing that builds generational wealth.',
    icon: '🏠',
    href: '/housing',
    color: 'from-purple-500 to-purple-600',
  },
]

export default function HomePillars() {
  return (
    <section className="py-16 md:py-24 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-[#1a5f3f] mb-4">Our Four Pillars</h2>
          <div className="h-1 w-24 bg-[#FFBC00] mx-auto mb-6"></div>
          <p className="text-xl text-gray-700 max-w-2xl mx-auto">
            Building a complete regenerative ecosystem that serves communities holistically.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((pillar) => (
            <Link
              key={pillar.title}
              href={pillar.href}
              className={`bg-gradient-to-br ${pillar.color} text-white rounded-lg p-8 shadow-lg hover:shadow-xl transition transform hover:-translate-y-1 ${
                pillar.href === '#' ? 'cursor-not-allowed opacity-75' : ''
              }`}
            >
              <div className="text-5xl mb-4">{pillar.icon}</div>
              <h3 className="text-2xl font-bold mb-3">{pillar.title}</h3>
              <p className="text-white/90">{pillar.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
