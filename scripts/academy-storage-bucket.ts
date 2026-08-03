/**
 * Shared safe academy-products bucket ensure/inspect helpers.
 * Never makes a bucket public. Production mutations require --allow-production.
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

export const ACADEMY_PRODUCTS_BUCKET = 'academy-products'
/** Canonical V1 file-size limit (50 MB). */
export const ACADEMY_BUCKET_FILE_SIZE_LIMIT = 52_428_800

export const NON_PROD_SUPABASE_REF = 'qlgffbrfewdziwgkowja'
export const PROD_SUPABASE_REF = 'nsvusykyqcwjimsiyeum'

export type BucketInspect = {
  name: string
  public: boolean
  fileSizeLimit: number | null
  createdAt: string | null
  updatedAt: string | null
}

export function supabaseProjectRef(url: string): string {
  try {
    const host = new URL(url).hostname
    return host.replace('.supabase.co', '')
  } catch {
    return ''
  }
}

export function assertAllowedStorageTarget(
  url: string,
  opts: { allowProduction: boolean },
): { ref: string; isProduction: boolean } {
  const ref = supabaseProjectRef(url)
  if (!ref) {
    throw new Error('Could not parse NEXT_PUBLIC_SUPABASE_URL')
  }
  const isProduction = ref === PROD_SUPABASE_REF
  if (isProduction && !opts.allowProduction) {
    throw new Error(
      `Refusing Production Supabase project (${ref}). Re-run with --allow-production only after explicit approval.`,
    )
  }
  if (!isProduction && ref !== NON_PROD_SUPABASE_REF) {
    throw new Error(
      `Unexpected Supabase project ref "${ref}". Expected non-prod "${NON_PROD_SUPABASE_REF}" (or Production with --allow-production).`,
    )
  }
  return { ref, isProduction }
}

export function getServiceRoleClient(url: string, key: string): SupabaseClient {
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

export async function inspectAcademyBucket(
  client: SupabaseClient,
): Promise<BucketInspect | null> {
  const { data, error } = await client.storage.getBucket(ACADEMY_PRODUCTS_BUCKET)
  if (error || !data) return null
  return {
    name: data.name,
    public: !!data.public,
    fileSizeLimit: data.file_size_limit ?? null,
    createdAt: data.created_at ?? null,
    updatedAt: data.updated_at ?? null,
  }
}

/**
 * Ensure private academy-products bucket exists at the V1 50 MB limit.
 * Existing buckets are inspected only — never recreated or made public.
 */
export async function ensureAcademyProductsBucket(
  client: SupabaseClient,
  opts: { uploadBytes?: number } = {},
): Promise<{ created: boolean; bucket: BucketInspect }> {
  const existing = await inspectAcademyBucket(client)
  if (existing) {
    if (existing.public) {
      throw new Error(
        `Bucket ${ACADEMY_PRODUCTS_BUCKET} is public — refusing to proceed. Fix manually.`,
      )
    }
    if (
      existing.fileSizeLimit != null &&
      opts.uploadBytes != null &&
      opts.uploadBytes > existing.fileSizeLimit
    ) {
      throw new Error(
        `Upload size ${opts.uploadBytes} exceeds bucket limit ${existing.fileSizeLimit}`,
      )
    }
    if (
      existing.fileSizeLimit != null &&
      existing.fileSizeLimit < ACADEMY_BUCKET_FILE_SIZE_LIMIT
    ) {
      console.warn(
        `Warning: bucket file_size_limit (${existing.fileSizeLimit}) is below canonical V1 ${ACADEMY_BUCKET_FILE_SIZE_LIMIT}. Not mutating; uploads may still succeed if under the existing limit.`,
      )
    }
    return { created: false, bucket: existing }
  }

  const { error } = await client.storage.createBucket(ACADEMY_PRODUCTS_BUCKET, {
    public: false,
    fileSizeLimit: ACADEMY_BUCKET_FILE_SIZE_LIMIT,
    allowedMimeTypes: [
      'application/zip',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/pdf',
      'application/octet-stream',
    ],
  })
  if (error && !/already exists/i.test(error.message)) {
    throw new Error(`Bucket create failed: ${error.message}`)
  }

  const created = await inspectAcademyBucket(client)
  if (!created) {
    throw new Error('Bucket create reported success but bucket is not readable')
  }
  if (created.public) {
    throw new Error('Newly created bucket is public — refusing to proceed')
  }
  return { created: true, bucket: created }
}
