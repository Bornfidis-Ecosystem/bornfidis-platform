/**
 * Shared Academy / Digital Studio entitlement checks.
 *
 * Entitlement is an AcademyPurchase row (direct slug or approved bundle membership).
 * Callers must not expose purchase or user details to unauthorized clients.
 */
import { getCurrentSupabaseUser } from '@/lib/auth'
import { db } from '@/lib/db'
import { getBundleSlugs, getIncludedSlugs } from '@/lib/academy-bundles'

export type AcademyEntitlementOk = {
  ok: true
  userId: string
  slug: string
  via: 'direct' | 'bundle'
}

export type AcademyEntitlementDenied = {
  ok: false
  reason: 'unauthenticated' | 'forbidden' | 'error'
  /** Present only when the user was authenticated but not entitled (or on error after auth). */
  userId?: string
}

export type AcademyEntitlementResult = AcademyEntitlementOk | AcademyEntitlementDenied

/**
 * Resolve the current user and check entitlement for a product slug.
 * Preserves existing download-route semantics (direct purchase, then bundle expand).
 */
export async function checkAcademyEntitlement(
  productSlug: string,
): Promise<AcademyEntitlementResult> {
  const slug = (productSlug || '').trim()
  if (!slug) {
    return { ok: false, reason: 'forbidden' }
  }

  let user: Awaited<ReturnType<typeof getCurrentSupabaseUser>>
  try {
    user = await getCurrentSupabaseUser()
  } catch {
    return { ok: false, reason: 'error' }
  }

  if (!user?.id) {
    return { ok: false, reason: 'unauthenticated' }
  }

  try {
    const direct = await db.academyPurchase.findFirst({
      where: { authUserId: user.id, productSlug: slug },
      select: { id: true },
    })
    if (direct) {
      return { ok: true, userId: user.id, slug, via: 'direct' }
    }

    const bundleSlugs = getBundleSlugs()
    if (bundleSlugs.length === 0) {
      return { ok: false, reason: 'forbidden', userId: user.id }
    }

    const bundlePurchases = await db.academyPurchase.findMany({
      where: { authUserId: user.id, productSlug: { in: bundleSlugs } },
      select: { productSlug: true },
    })

    for (const p of bundlePurchases) {
      if (getIncludedSlugs(p.productSlug).includes(slug)) {
        return { ok: true, userId: user.id, slug, via: 'bundle' }
      }
    }

    return { ok: false, reason: 'forbidden', userId: user.id }
  } catch {
    return { ok: false, reason: 'error', userId: user.id }
  }
}

/** True when the user is entitled to the product slug. */
export async function hasAcademyEntitlement(productSlug: string): Promise<boolean> {
  const result = await checkAcademyEntitlement(productSlug)
  return result.ok
}
