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
  getBbosZipAsset,
} from '@/lib/bbos-library-manifest'

/** Signed-URL lifetime. Deliberately short so a leaked link is useless quickly. */
export const SIGNED_URL_TTL_SECONDS = 60

export interface ObjectStorageProduct {
  /** Private Supabase Storage bucket. */
  bucket: string
  /** Fixed object key inside the bucket. Never derived from request input. */
  objectPath: string
  /** Filename presented to the customer via Content-Disposition. */
  downloadFilename: string
}

/**
 * Server-controlled registry of object-storage-backed products, keyed by the
 * same slug used for AcademyPurchase entitlement. Register a product here only
 * after its asset has been uploaded to the private bucket by an operator.
 *
 * BBOS individual tools are resolved via the BBOS manifest asset registry
 * (see resolveObjectStorageDownload).
 */
const OBJECT_STORAGE_PRODUCTS: Record<string, ObjectStorageProduct> = {
  [BBOS_PRODUCT_SLUG]: {
    bucket: 'academy-products',
    objectPath: getBbosZipAsset().storageObjectPath,
    downloadFilename: getBbosZipAsset().customerFilename,
  },
}

/** Returns the registered default (ZIP) object-storage product for a slug, or null. */
export function getObjectStorageProduct(slug: string): ObjectStorageProduct | null {
  return OBJECT_STORAGE_PRODUCTS[(slug || '').trim()] ?? null
}

/** True if the slug is delivered via private object storage (vs. legacy disk). */
export function isObjectStorageSlug(slug: string): boolean {
  return getObjectStorageProduct(slug) !== null
}

export type SignedDownloadResult =
  | { ok: true; url: string; downloadFilename: string; expiresIn: number }
  | { ok: false; error: string }

/**
 * Resolve a storage object for a product slug and optional asset query id.
 * Unknown asset ids return null (caller should 404).
 */
export function resolveObjectStorageDownload(
  slug: string,
  assetQueryId?: string | null,
): ObjectStorageProduct | null {
  const trimmed = (slug || '').trim()
  const product = getObjectStorageProduct(trimmed)
  if (!product) return null

  const assetId = (assetQueryId || '').trim()
  if (!assetId) {
    return product
  }

  if (trimmed !== BBOS_PRODUCT_SLUG) {
    return null
  }

  const asset = getBbosAssetByQueryId(assetId)
  if (!asset) return null

  return {
    bucket: product.bucket,
    objectPath: asset.storageObjectPath,
    downloadFilename: asset.customerFilename,
  }
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
 * product (and optional BBOS asset). The caller MUST have already verified
 * the user's entitlement.
 *
 * Never logs the signed URL or the service-role key. Returns a typed result;
 * signing failures resolve to { ok: false } rather than throwing.
 */
export async function createSignedDownloadUrl(
  slug: string,
  assetQueryId?: string | null,
): Promise<SignedDownloadResult> {
  const product = resolveObjectStorageDownload(slug, assetQueryId)
  if (!product) {
    return {
      ok: false,
      error: assetQueryId?.trim() ? 'unknown_asset' : 'not_object_storage_product',
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
        asset: assetQueryId?.trim() || 'zip',
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
      asset: assetQueryId?.trim() || 'zip',
      reason: err instanceof Error ? err.message : 'unknown',
    })
    return { ok: false, error: 'signing_failed' }
  }
}
