'use server'

import { revalidatePath } from 'next/cache'
import { requireAdminUser } from '@/lib/requireAdmin'
import { db } from '@/lib/db'

export interface AcademyProductRow {
  id: string
  slug: string
  title: string
  description: string
  type: string
  priceCents: number
  stripePriceId: string | null
  active: boolean
  featured: boolean
  createdAt: Date
  updatedAt: Date
  purchaseCount: number
  enrollmentCount: number
}

export async function getAcademyProducts(): Promise<{
  success: boolean
  products?: AcademyProductRow[]
  error?: string
}> {
  try {
    await requireAdminUser()
  } catch (e: unknown) {
    return { success: false, error: e instanceof Error ? e.message : 'Authentication required' }
  }

  try {
    const [products, purchaseCounts, enrollmentCounts] = await Promise.all([
      db.academyProduct.findMany({
        orderBy: { updatedAt: 'desc' },
      }),
      db.academyPurchase.groupBy({
        by: ['productSlug'],
        _count: { id: true },
      }),
      db.academyEnrollment.groupBy({
        by: ['productSlug'],
        _count: { id: true },
      }),
    ])

    const purchaseBySlug = Object.fromEntries(
      purchaseCounts.map((p) => [p.productSlug, p._count.id])
    )
    const enrollmentBySlug = Object.fromEntries(
      enrollmentCounts.map((e) => [e.productSlug, e._count.id])
    )

    const rows: AcademyProductRow[] = products.map((p) => ({
      id: p.id,
      slug: p.slug,
      title: p.title,
      description: p.description,
      type: p.type,
      priceCents: p.priceCents,
      stripePriceId: p.stripePriceId,
      active: p.active,
      featured: (p as { featured?: boolean }).featured ?? false,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      purchaseCount: purchaseBySlug[p.slug] ?? 0,
      enrollmentCount: enrollmentBySlug[p.slug] ?? 0,
    }))

    return { success: true, products: rows }
  } catch (e) {
    console.error('[academy-products] getAcademyProducts', e)
    return {
      success: false,
      error: e instanceof Error ? e.message : 'Failed to load products',
    }
  }
}

export async function createAcademyProduct(data: {
  slug: string
  title: string
  description: string
  type: string
  priceCents: number
  stripePriceId?: string | null
  active?: boolean
  featured?: boolean
}): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdminUser()
  } catch (e: unknown) {
    return { success: false, error: e instanceof Error ? e.message : 'Authentication required' }
  }

  const slug = data.slug.trim().toLowerCase().replace(/\s+/g, '-')
  if (!slug) return { success: false, error: 'Slug is required' }
  if (!data.title?.trim()) return { success: false, error: 'Title is required' }

  try {
    await db.academyProduct.create({
      data: {
        slug,
        title: data.title.trim(),
        description: (data.description ?? '').trim(),
        type: (data.type ?? 'COURSE').trim() || 'COURSE',
        priceCents: Number(data.priceCents) ?? 0,
        stripePriceId: data.stripePriceId?.trim() || null,
        active: data.active ?? true,
        featured: data.featured ?? false,
      },
    })
    revalidatePath('/admin/academy-products')
    return { success: true }
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Create failed'
    if (String(msg).includes('Unique constraint') || String(msg).includes('unique')) {
      return { success: false, error: 'A product with this slug already exists' }
    }
    console.error('[academy-products] create', e)
    return { success: false, error: msg }
  }
}

export async function updateAcademyProduct(
  id: string,
  data: {
    title?: string
    description?: string
    type?: string
    priceCents?: number
    stripePriceId?: string | null
    active?: boolean
    featured?: boolean
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdminUser()
  } catch (e: unknown) {
    return { success: false, error: e instanceof Error ? e.message : 'Authentication required' }
  }

  try {
    const payload: Record<string, unknown> = {}
    if (data.title !== undefined) payload.title = data.title.trim()
    if (data.description !== undefined) payload.description = data.description.trim()
    if (data.type !== undefined) payload.type = data.type.trim()
    if (data.priceCents !== undefined) payload.priceCents = Number(data.priceCents)
    if (data.stripePriceId !== undefined) payload.stripePriceId = data.stripePriceId?.trim() || null
    if (data.active !== undefined) payload.active = data.active
    if (data.featured !== undefined) payload.featured = data.featured
    if (Object.keys(payload).length === 0) return { success: true }

    await db.academyProduct.update({
      where: { id },
      data: payload as any,
    })
    revalidatePath('/admin/academy-products')
    return { success: true }
  } catch (e) {
    console.error('[academy-products] update', e)
    return {
      success: false,
      error: e instanceof Error ? e.message : 'Update failed',
    }
  }
}

export async function setAcademyProductActive(
  id: string,
  active: boolean
): Promise<{ success: boolean; error?: string }> {
  return updateAcademyProduct(id, { active })
}

export async function setAcademyProductFeatured(
  id: string,
  featured: boolean
): Promise<{ success: boolean; error?: string }> {
  return updateAcademyProduct(id, { featured })
}
