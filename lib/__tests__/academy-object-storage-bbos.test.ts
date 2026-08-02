/**
 * Unit tests for BBOS asset resolution (no live Supabase signing).
 *   npx tsx --test lib/__tests__/academy-object-storage-bbos.test.ts
 */
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  isObjectStorageSlug,
  resolveObjectStorageDownload,
  SIGNED_URL_TTL_SECONDS,
} from '../academy-object-storage'
import { BBOS_PRODUCT_SLUG } from '../bbos-library-manifest'

describe('academy-object-storage BBOS assets', () => {
  it('keeps 60s signed URL TTL', () => {
    assert.equal(SIGNED_URL_TTL_SECONDS, 60)
  })

  it('treats BBOS as object-storage slug', () => {
    assert.equal(isObjectStorageSlug(BBOS_PRODUCT_SLUG), true)
    assert.equal(isObjectStorageSlug('llc-starter-kit'), false)
  })

  it('resolves default ZIP and allowlisted assets', () => {
    const zip = resolveObjectStorageDownload(BBOS_PRODUCT_SLUG, null)
    assert.ok(zip)
    assert.match(zip!.objectPath, /bornfidis-business-operating-system-v1\.zip$/)
    assert.match(zip!.downloadFilename, /\.zip$/)

    const calc = resolveObjectStorageDownload(BBOS_PRODUCT_SLUG, 'calculator')
    assert.ok(calc)
    assert.equal(
      calc!.objectPath,
      'bornfidis-business-operating-system/v1/bbos-pricing-margin-calculator-v1.xlsx',
    )
    assert.equal(calc!.downloadFilename, 'BBOS-Pricing-Margin-Calculator-v1.xlsx')

    const wb = resolveObjectStorageDownload(BBOS_PRODUCT_SLUG, 'weekly-rhythm-workbook')
    assert.ok(wb)
    assert.match(wb!.objectPath, /bbos-weekly-operating-rhythm-workbook-v1\.xlsx$/)
  })

  it('returns null for unknown asset ids (route should 404)', () => {
    assert.equal(resolveObjectStorageDownload(BBOS_PRODUCT_SLUG, 'not-a-real-asset'), null)
    assert.equal(resolveObjectStorageDownload(BBOS_PRODUCT_SLUG, 'zip'), null)
  })

  it('does not resolve assets for non-BBOS object-storage slugs', () => {
    // Only BBOS is registered today; unknown slug → null
    assert.equal(resolveObjectStorageDownload('some-other-product', 'calculator'), null)
  })
})
