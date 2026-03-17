/**
 * Public Academy product resolution: DB first, then static config.
 * Used by the academy page, product detail page, checkout, and claim/download flows.
 */

import { db } from '@/lib/db'
import {
  getAcademyProductBySlug,
  type AcademyProduct,
  type AcademyCategory,
  type AcademyPillarSlug,
} from '@/lib/academy-products'

/** Map Prisma AcademyProduct to the public AcademyProduct shape (for grid/detail/checkout). Enriches with pillar, category, image, subtitle from static config by slug. */
function mapDbToPublic(row: {
  slug: string
  title: string
  description: string
  type: string
  priceCents: number
  stripePriceId: string | null
}): AcademyProduct {
  const priceDisplay =
    row.priceCents === 0 ? 'FREE' : `$${Math.round(row.priceCents / 100)}`
  const staticProduct = getAcademyProductBySlug(row.slug)
  const pillar: AcademyPillarSlug = staticProduct?.pillar ?? 'education-enterprise'
  return {
    slug: row.slug,
    title: row.title,
    description: row.description,
    type: row.type as AcademyProduct['type'],
    priceDisplay,
    priceCents: row.priceCents,
    category: (staticProduct?.category ?? 'Foundations') as AcademyCategory,
    pillar,
    stripePriceId: row.stripePriceId ?? '',
    image: staticProduct?.image,
    subtitle: staticProduct?.subtitle,
  }
}

/**
 * Load active Academy products from DB for the public academy page.
 * Ordered by featured (desc) then updatedAt (desc).
 */
export async function getAcademyProductsFromDb(): Promise<AcademyProduct[]> {
  const rows = await db.academyProduct.findMany({
    where: { active: true },
    orderBy: [{ featured: 'desc' }, { updatedAt: 'desc' }],
  })
  return rows.map(mapDbToPublic)
}

/**
 * Resolve a product by slug: DB first (active only), then static config.
 * Use for checkout, claim, download, and product detail page so slug-based flows keep working.
 */
export async function getAcademyProductBySlugPublic(
  slug: string
): Promise<AcademyProduct | null> {
  const trimmed = (slug || '').trim()
  if (!trimmed) return null

  const fromDb = await db.academyProduct.findFirst({
    where: { slug: trimmed, active: true },
  })
  if (fromDb) return mapDbToPublic(fromDb)

  return getAcademyProductBySlug(trimmed)
}
