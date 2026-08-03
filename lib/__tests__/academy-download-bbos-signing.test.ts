/**
 * Download signing edge cases without requiring real Storage objects.
 * Tests 7–9 asset allowlisting / failure modes use mocks / env isolation.
 *
 *   npx tsx --test lib/__tests__/academy-download-bbos-signing.test.ts
 */
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { createSignedDownloadUrl } from '../academy-object-storage'
import { BBOS_PRODUCT_SLUG } from '../bbos-library-manifest'

describe('BBOS signed download (mocked / no real assets)', () => {
  it('unknown asset fails before signing (404 path)', async () => {
    const result = await createSignedDownloadUrl(BBOS_PRODUCT_SLUG, 'not-real')
    assert.equal(result.ok, false)
    if (!result.ok) {
      assert.equal(result.error, 'unknown_asset')
    }
  })

  it('calculator asset fails closed when storage env missing (no URL leaked)', async () => {
    const prevUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const prevKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    try {
      delete process.env.NEXT_PUBLIC_SUPABASE_URL
      delete process.env.SUPABASE_SERVICE_ROLE_KEY
      const result = await createSignedDownloadUrl(BBOS_PRODUCT_SLUG, 'calculator')
      assert.equal(result.ok, false)
      if (!result.ok) {
        assert.equal(result.error, 'storage_not_configured')
      }
      assert.ok(!('url' in result))
    } finally {
      if (prevUrl !== undefined) process.env.NEXT_PUBLIC_SUPABASE_URL = prevUrl
      else delete process.env.NEXT_PUBLIC_SUPABASE_URL
      if (prevKey !== undefined) process.env.SUPABASE_SERVICE_ROLE_KEY = prevKey
      else delete process.env.SUPABASE_SERVICE_ROLE_KEY
    }
  })

  it('workbook fails closed without env; no-asset and full-package are unavailable', async () => {
    const prevUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const prevKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    try {
      delete process.env.NEXT_PUBLIC_SUPABASE_URL
      delete process.env.SUPABASE_SERVICE_ROLE_KEY
      const wb = await createSignedDownloadUrl(BBOS_PRODUCT_SLUG, 'weekly-rhythm-workbook')
      const noAsset = await createSignedDownloadUrl(BBOS_PRODUCT_SLUG, null)
      const full = await createSignedDownloadUrl(BBOS_PRODUCT_SLUG, 'full-package')
      assert.equal(wb.ok, false)
      if (!wb.ok) assert.equal(wb.error, 'storage_not_configured')
      assert.equal(noAsset.ok, false)
      if (!noAsset.ok) assert.equal(noAsset.error, 'asset_unavailable')
      assert.equal(full.ok, false)
      if (!full.ok) assert.equal(full.error, 'asset_unavailable')
    } finally {
      if (prevUrl !== undefined) process.env.NEXT_PUBLIC_SUPABASE_URL = prevUrl
      else delete process.env.NEXT_PUBLIC_SUPABASE_URL
      if (prevKey !== undefined) process.env.SUPABASE_SERVICE_ROLE_KEY = prevKey
      else delete process.env.SUPABASE_SERVICE_ROLE_KEY
    }
  })
})
