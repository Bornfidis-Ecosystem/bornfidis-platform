interface HomeImpactProps {
  impact: {
    food_tons: number
    meals_served: number
    land_acres: number
    farmers: number
    chefs: number
  }
}

export default function HomeImpact({ impact }: HomeImpactProps) {
  const impactStats = [
    {
      label: 'Tons of Food',
      value: impact.food_tons.toLocaleString(),
      icon: '🌾',
    },
    {
      label: 'Meals Served',
      value: impact.meals_served.toLocaleString(),
      icon: '🍽️',
    },
    {
      label: 'Acres Regenerated',
      value: impact.land_acres.toLocaleString(),
      icon: '🌱',
    },
    {
      label: 'Farmers Supported',
      value: impact.farmers.toString(),
      icon: '👨‍🌾',
    },
    {
      label: 'Chefs Deployed',
      value: impact.chefs.toString(),
      icon: '👨‍🍳',
    },
  ]

  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-[#1a5f3f] to-[#154a32] text-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Our Impact</h2>
          <div className="h-1 w-24 bg-[#FFBC00] mx-auto mb-6"></div>
          <p className="text-xl text-green-100 max-w-2xl mx-auto">
            Every meal, every farmer, every acre—building a regenerative future together.
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          {impactStats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-4xl mb-3">{stat.icon}</div>
              <div className="text-3xl md:text-4xl font-bold text-[#FFBC00] mb-2">{stat.value}</div>
              <div className="text-sm text-green-100">{stat.label}</div>
            </div>
          ))}
        </div>
        <div className="text-center mt-12">
          <a
            href="/impact"
            className="inline-block px-8 py-3 bg-[#FFBC00] text-[#1a5f3f] rounded-lg font-semibold hover:bg-gold-dark transition"
          >
            View Full Impact Report
          </a>
        </div>
      </div>
    </section>
  )
}
