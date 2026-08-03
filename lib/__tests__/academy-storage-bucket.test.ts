/**
 *   npx tsx --test lib/__tests__/academy-storage-bucket.test.ts
 */
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  ACADEMY_BUCKET_FILE_SIZE_LIMIT,
  assertAllowedStorageTarget,
  NON_PROD_SUPABASE_REF,
  PROD_SUPABASE_REF,
} from '../../scripts/academy-storage-bucket'

describe('academy-storage-bucket helpers', () => {
  it('uses 50 MB as the canonical V1 default', () => {
    assert.equal(ACADEMY_BUCKET_FILE_SIZE_LIMIT, 52_428_800)
  })

  it('allows the known non-prod project without a production flag', () => {
    const r = assertAllowedStorageTarget(`https://${NON_PROD_SUPABASE_REF}.supabase.co`, {
      allowProduction: false,
    })
    assert.equal(r.ref, NON_PROD_SUPABASE_REF)
    assert.equal(r.isProduction, false)
  })

  it('refuses Production without --allow-production', () => {
    assert.throws(
      () =>
        assertAllowedStorageTarget(`https://${PROD_SUPABASE_REF}.supabase.co`, {
          allowProduction: false,
        }),
      /Refusing Production/,
    )
  })

  it('allows Production only with explicit flag', () => {
    const r = assertAllowedStorageTarget(`https://${PROD_SUPABASE_REF}.supabase.co`, {
      allowProduction: true,
    })
    assert.equal(r.isProduction, true)
  })

  it('refuses unknown project refs', () => {
    assert.throws(
      () =>
        assertAllowedStorageTarget('https://someotherproject.supabase.co', {
          allowProduction: false,
        }),
      /Unexpected Supabase project/,
    )
  })
})
