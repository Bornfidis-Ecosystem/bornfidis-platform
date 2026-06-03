import Link from 'next/link'
import { Card } from '@/components/ui/Card'

/**
 * Featured chefs for homepage. Fetches from public API; shows up to 5 with "Featured" label.
 */
async function getFeaturedChefs(): Promise<Array<{ id: string; name: string }>> {
  try {
    const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const res = await fetch(`${base}/api/public/featured-chefs`, { cache: 'no-store' })
    if (!res.ok) return []
    const data = await res.json()
    return Array.isArray(data.chefs) ? data.chefs : []
  } catch {
    return []
  }
}

export async function FeaturedChefsSection() {
  const chefs = await getFeaturedChefs()
  if (chefs.length === 0) return null

  return (
    <section className="mb-16">
      <p className="text-sm font-semibold uppercase tracking-wider text-goldAccent mb-2">
        Provisions
      </p>
      <h2 className="text-3xl font-bold text-forest mb-2">Featured Chefs</h2>
      <p className="text-gray-600 text-sm mb-6 max-w-lg">
        Top-rated, verified chefs ready to serve.
      </p>
      <Card className="max-w-md">
        <ul className="space-y-2">
          {chefs.map((chef) => (
            <li key={chef.id} className="text-forest font-medium">
              {chef.name}
            </li>
          ))}
        </ul>
        <Link
          href="/book"
          className="inline-block mt-4 text-sm font-semibold text-forest hover:underline"
        >
          Book a chef →
        </Link>
      </Card>
    </section>
  )
}
