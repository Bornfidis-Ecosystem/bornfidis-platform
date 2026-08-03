/**
 * Private object-storage delivery for paid digital products.
 *
 * Server-only. Uses the Supabase service-role client to mint short-lived signed
 * URLs for entitled downloads. The object path is ALWAYS resolved from the
 * server-controlled map below — never from request input — so a caller can only
 * ever reach an asset we have explicitly registered here.
 *
 * Entitlement (authenticated user + valid AcademyPurchase / bundle) is enforced
 * by the caller (the download route) BEFORE any signed URL is created. This
 * module intentionally performs no entitlement checks.
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import {
  BBOS_PRODUCT_SLUG,
  getBbosAssetByQueryId,
  isBbosProductSlug,
} from '@/lib/bbos-library-manifest'

/** Signed-URL lifetime. Deliberately short so a leaked link is useless quickly. */
export const SIGNED_URL_TTL_SECONDS = 60

export const ACADEMY_PRODUCTS_BUCKET = 'academy-products'

export interface ObjectStorageProduct {
  /** Private Supabase Storage bucket. */
  bucket: string
  /** Fixed object key inside the bucket. Never derived from request input. */
  objectPath: string
  /** Filename presented to the customer via Content-Disposition. */
  downloadFilename: string
}

/**
 * BBOS is object-storage backed. There is no silent default ZIP — callers must
 * pass an allowlisted ?asset= id for an available asset.
 */
export function isObjectStorageSlug(slug: string): boolean {
  return isBbosProductSlug(slug)
}

/** Returns a bucket marker for BBOS (no default object path). */
export function getObjectStorageProduct(slug: string): ObjectStorageProduct | null {
  if (!isObjectStorageSlug(slug)) return null
  return {
    bucket: ACADEMY_PRODUCTS_BUCKET,
    objectPath: '',
    downloadFilename: '',
  }
}

export type SignedDownloadResult =
  | { ok: true; url: string; downloadFilename: string; expiresIn: number }
  | { ok: false; error: string }

/**
 * Resolve a storage object for a product slug and required asset query id.
 * - Missing asset / unavailable full-package → null (caller fail-closed)
 * - Unknown asset ids → null
 */
export function resolveObjectStorageDownload(
  slug: string,
  assetQueryId?: string | null,
): ObjectStorageProduct | null {
  const trimmed = (slug || '').trim()
  if (!isObjectStorageSlug(trimmed)) return null

  const assetId = (assetQueryId || '').trim()
  if (!assetId) return null

  const asset = getBbosAssetByQueryId(assetId)
  if (!asset || !asset.available) return null

  return {
    bucket: ACADEMY_PRODUCTS_BUCKET,
    objectPath: asset.storageObjectPath,
    downloadFilename: asset.customerFilename,
  }
}

/** True when the asset exists in the registry but is intentionally unavailable. */
export function isUnavailableBbosAsset(assetQueryId?: string | null): boolean {
  const id = (assetQueryId || '').trim()
  if (!id) return true // no-asset default = full package unavailable
  const asset = getBbosAssetByQueryId(id)
  return !!asset && !asset.available
}

function getServiceRoleClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error('Supabase storage env vars missing')
  }
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

/**
 * Create a short-lived signed download URL for a registered object-storage
 * product asset. The caller MUST have already verified the user's entitlement.
 *
 * Never logs the signed URL or the service-role key. Returns a typed result;
 * signing failures resolve to { ok: false } rather than throwing.
 */
export async function createSignedDownloadUrl(
  slug: string,
  assetQueryId?: string | null,
): Promise<SignedDownloadResult> {
  if (isUnavailableBbosAsset(assetQueryId) && isObjectStorageSlug(slug)) {
    return { ok: false, error: 'asset_unavailable' }
  }

  const product = resolveObjectStorageDownload(slug, assetQueryId)
  if (!product || !product.objectPath) {
    return {
      ok: false,
      error: assetQueryId?.trim() ? 'unknown_asset' : 'asset_unavailable',
    }
  }

  let client: SupabaseClient
  try {
    client = getServiceRoleClient()
  } catch {
    return { ok: false, error: 'storage_not_configured' }
  }

  try {
    const { data, error } = await client.storage
      .from(product.bucket)
      .createSignedUrl(product.objectPath, SIGNED_URL_TTL_SECONDS, {
        download: product.downloadFilename,
      })

    if (error || !data?.signedUrl) {
      console.error('[academy-object-storage] signing failed', {
        slug,
        bucket: product.bucket,
        asset: assetQueryId?.trim() || '(none)',
        reason: error?.message ?? 'no signed url returned',
      })
      return { ok: false, error: 'signing_failed' }
    }

    return {
      ok: true,
      url: data.signedUrl,
      downloadFilename: product.downloadFilename,
      expiresIn: SIGNED_URL_TTL_SECONDS,
    }
  } catch (err) {
    console.error('[academy-object-storage] signing threw', {
      slug,
      bucket: product.bucket,
      asset: assetQueryId?.trim() || '(none)',
      reason: err instanceof Error ? err.message : 'unknown',
    })
    return { ok: false, error: 'signing_failed' }
  }
}
