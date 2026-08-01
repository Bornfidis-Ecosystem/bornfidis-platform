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
 */
const OBJECT_STORAGE_PRODUCTS: Record<string, ObjectStorageProduct> = {
  'bornfidis-business-operating-system': {
    bucket: 'academy-products',
    objectPath:
      'bornfidis-business-operating-system/v1/bornfidis-business-operating-system-v1.zip',
    downloadFilename: 'Bornfidis-Business-Operating-System-v1.zip',
  },
}

/** Returns the registered object-storage product for a slug, or null. */
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
 * product. The caller MUST have already verified the user's entitlement.
 *
 * Never logs the signed URL or the service-role key. Returns a typed result;
 * signing failures resolve to { ok: false } rather than throwing.
 */
export async function createSignedDownloadUrl(
  slug: string,
): Promise<SignedDownloadResult> {
  const product = getObjectStorageProduct(slug)
  if (!product) {
    return { ok: false, error: 'not_object_storage_product' }
  }

  let client: SupabaseClient
  try {
    client = getServiceRoleClient()
  } catch {
    // Do not surface env details beyond a generic code.
    return { ok: false, error: 'storage_not_configured' }
  }

  try {
    const { data, error } = await client.storage
      .from(product.bucket)
      .createSignedUrl(product.objectPath, SIGNED_URL_TTL_SECONDS, {
        download: product.downloadFilename,
      })

    if (error || !data?.signedUrl) {
      // Log the failure reason only — never the signed URL or any secret.
      console.error('[academy-object-storage] signing failed', {
        slug,
        bucket: product.bucket,
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
      reason: err instanceof Error ? err.message : 'unknown',
    })
    return { ok: false, error: 'signing_failed' }
  }
}
