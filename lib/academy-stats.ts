import { db } from '@/lib/db'
import { getAcademyProductBySlug } from '@/lib/academy-products'

export interface AcademyStatsRevenueByProduct {
  slug: string
  title: string
  sales: number
  revenue: number
}

export interface AcademyStats {
  totalRevenue: number
  totalPaidSales: number
  totalFreeClaims: number
  averageOrderValue: number
  /** Paid sales per free claim (totalPaidSales / (totalFreeClaims || 1)); display as % for context */
  freeToPaidConversionRate: number
  revenueByProduct: AcademyStatsRevenueByProduct[]
}

export interface AcademyStatsWithPeriod extends AcademyStats {
  lifetimeRevenue?: number
  last30DaysRevenue?: number
}

/**
 * Compute Academy metrics using Prisma groupBy for revenue-by-product.
 * Optionally pass since to filter to purchases created on or after that date (e.g. last 30 days).
 */
export async function getAcademyStats(since?: Date): Promise<AcademyStats> {
  const where = since ? { createdAt: { gte: since } } : {}

  const [grouped, totalPaidSales, totalFreeClaims] = await Promise.all([
    db.academyPurchase.groupBy({
      by: ['productSlug'],
      _count: { id: true },
      _sum: { productPrice: true },
      where,
    }),
    db.academyPurchase.count({
      where: { ...where, productPrice: { gt: 0 } },
    }),
    db.academyPurchase.count({
      where: { ...where, stripeSessionId: { startsWith: 'free-' } },
    }),
  ])

  const revenueByProduct: AcademyStatsRevenueByProduct[] = grouped.map((row) => {
    const product = getAcademyProductBySlug(row.productSlug)
    return {
      slug: row.productSlug,
      title: product?.title ?? row.productSlug,
      sales: row._count.id,
      revenue: row._sum.productPrice ?? 0,
    }
  })

  const totalRevenue = revenueByProduct.reduce((sum, r) => sum + r.revenue, 0)
  const averageOrderValue = totalPaidSales > 0 ? Math.round(totalRevenue / totalPaidSales) : 0
  const freeToPaidConversionRate = totalPaidSales / (totalFreeClaims || 1)

  return {
    totalRevenue,
    totalPaidSales,
    totalFreeClaims,
    averageOrderValue,
    freeToPaidConversionRate,
    revenueByProduct: revenueByProduct.sort((a, b) => b.revenue - a.revenue),
  }
}

/**
 * Get lifetime and last-30-days stats for momentum insight.
 */
export async function getAcademyStatsWithPeriod(): Promise<AcademyStatsWithPeriod> {
  const since30 = new Date()
  since30.setDate(since30.getDate() - 30)

  const [lifetime, last30] = await Promise.all([
    getAcademyStats(),
    getAcademyStats(since30),
  ])

  return {
    ...lifetime,
    lifetimeRevenue: lifetime.totalRevenue,
    last30DaysRevenue: last30.totalRevenue,
  }
}
