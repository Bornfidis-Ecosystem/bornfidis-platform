import { getAcademyProductBySlug } from '@/lib/academy-products'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { TrustStrip } from '@/components/ui/TrustStrip'

/** All four main manuals for homepage showcase. */
const FEATURED_SLUGS = [
  'regenerative-enterprise-foundations',
  'regenerative-farmer-blueprint',
  'vermont-contractor-foundations',
  'jamaican-chef-enterprise-system',
]

export function FeaturedAcademySection() {
  const products = FEATURED_SLUGS.flatMap((slug) => {
    const p = getAcademyProductBySlug(slug)
    return p ? [p] : []
  })

  if (products.length === 0) return null

  return (
    <section className="w-full">
      <p className="text-sm font-semibold uppercase tracking-wider text-goldAccent text-center mb-2">
        Featured
      </p>
      <h2 className="text-3xl md:text-4xl font-bold text-forest mb-2 text-center">
        Learn. Build. Scale.
      </h2>
      <p className="text-gray-600 text-center mb-8 max-w-xl mx-auto">
        Operational systems for regenerative entrepreneurs.
      </p>

      <TrustStrip className="mb-10" />

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {products.map((p) => (
          <Card key={p.slug} href={`/academy/${p.slug}`}>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-forest text-goldAccent uppercase tracking-wide">
              {p.category}
            </span>
            <h3 className="text-xl font-bold text-forest mt-4 mb-2">{p.title}</h3>
            <p className="text-sm text-gray-600 line-clamp-2 mb-4">{p.description}</p>
            <span className="text-base font-semibold text-forest">{p.priceDisplay}</span>
            <span className="block text-sm font-medium text-forest mt-2 group-hover:underline">
              Learn more →
            </span>
          </Card>
        ))}
      </div>

      <p className="text-center mt-10">
        <Button href="/academy" variant="primary" className="px-8 py-3">
          Browse Academy
        </Button>
      </p>
    </section>
  )
}
