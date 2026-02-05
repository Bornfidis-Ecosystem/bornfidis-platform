import Link from 'next/link'

/**
 * Phase 2X — Featured chefs for homepage (optional section).
 * Fetches from public API; shows up to 5 with "⭐ Featured" and tooltip.
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
    <section className="w-full max-w-md mt-6 p-4 rounded-lg border border-green-200 bg-white/80">
      <h2 className="text-sm font-semibold text-green-900 mb-2 flex items-center gap-1">
        <span aria-hidden>⭐</span> Featured Chefs
      </h2>
      <p className="text-xs text-gray-600 mb-3" title="Top-rated, verified chef">
        Top-rated, verified chefs
      </p>
      <ul className="space-y-1">
        {chefs.map((chef) => (
          <li key={chef.id} className="text-sm text-gray-800">
            <span className="font-medium">{chef.name}</span>
          </li>
        ))}
      </ul>
      <Link
        href="/book"
        className="inline-block mt-3 text-sm text-green-800 font-medium hover:underline"
      >
        Book a chef →
      </Link>
    </section>
  )
}
