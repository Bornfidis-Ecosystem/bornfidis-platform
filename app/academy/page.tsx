import Link from 'next/link'
import {
  getAcademyProductsByCategory,
  type AcademyCategory,
  type AcademyProduct,
} from '@/lib/academy-products'
import ProductCard from '@/components/academy/ProductCard'
import { TrustStrip } from '@/components/ui/TrustStrip'
import { getCurrentSupabaseUser } from '@/lib/auth'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export default async function AcademyPage() {
  const byCategory = getAcademyProductsByCategory()
  const user = await getCurrentSupabaseUser()
  const purchasedSlugs = user
    ? new Set(
        (
          await db.academyPurchase.findMany({
            where: { authUserId: user.id },
            select: { productSlug: true },
          })
        ).map((p) => p.productSlug)
      )
    : new Set<string>()

  return (
    <main className="max-w-6xl mx-auto px-6 py-16">
      <header className="mb-12">
        <h1 className="text-4xl font-bold text-forest mb-4">
          Bornfidis Academy
        </h1>
        <p className="text-gray-600 mb-1">
          Templates, courses, and tools to grow your business. Clean. Premium.
        </p>
        <p className="text-gray-600">
          Operational systems for regenerative entrepreneurs.
        </p>
        <TrustStrip className="mt-6 mb-2" />
      </header>

      {Array.from(byCategory.entries()).map(([category, products]: [AcademyCategory, AcademyProduct[]]) => (
          <section key={category} className="mb-16">
            <h2 className="text-3xl font-bold text-forest mb-6 border-b border-goldAccent/40 pb-2">
              {category}
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product.slug}
                  product={product}
                  purchased={purchasedSlugs.has(product.slug)}
                />
              ))}
            </div>
          </section>
      ))}

      <p className="text-center text-sm text-gray-500 mt-8">
        <Link href="/dashboard/library" className="text-forest hover:underline">
          View your library
        </Link>
        {' · '}
        <Link href="/payments" className="text-forest hover:underline">
          Payment & participation
        </Link>
      </p>
    </main>
  )
}

