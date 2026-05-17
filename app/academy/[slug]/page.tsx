import { notFound } from 'next/navigation'

import { AcademyProductDetail } from '@/components/academy/AcademyProductDetail'
import { getAcademyProductBySlugPublic } from '@/lib/academy-products-public'
import { getAcademyStats } from '@/lib/academy-stats'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function AcademyProductPage({ params }: PageProps) {
  const { slug } = await params
  const product = await getAcademyProductBySlugPublic(slug)
  if (!product) notFound()

  let purchaseCount: number | null = null
  try {
    const stats = await getAcademyStats()
    const byProduct = stats.revenueByProduct.find((r) => r.slug === slug)
    if (byProduct) purchaseCount = byProduct.sales
  } catch {
    // non-blocking
  }

  return <AcademyProductDetail product={product} purchaseCount={purchaseCount} />
}
