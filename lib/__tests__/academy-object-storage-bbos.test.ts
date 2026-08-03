/**
 * Unit tests for BBOS asset resolution (no live Supabase signing).
 *   npx tsx --test lib/__tests__/academy-object-storage-bbos.test.ts
 */
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  isObjectStorageSlug,
  isUnavailableBbosAsset,
  resolveObjectStorageDownload,
  SIGNED_URL_TTL_SECONDS,
} from '../academy-object-storage'
import {
  BBOS_PRODUCT_SLUG,
  getBbosFullPackageAsset,
  getBbosToolsBundleAsset,
} from '../bbos-library-manifest'

describe('academy-object-storage BBOS assets', () => {
  it('keeps 60s signed URL TTL', () => {
    assert.equal(SIGNED_URL_TTL_SECONDS, 60)
  })

  it('treats BBOS as object-storage slug', () => {
    assert.equal(isObjectStorageSlug(BBOS_PRODUCT_SLUG), true)
    assert.equal(isObjectStorageSlug('llc-starter-kit'), false)
  })

  it('does not resolve a default ZIP without asset query', () => {
    assert.equal(resolveObjectStorageDownload(BBOS_PRODUCT_SLUG, null), null)
    assert.equal(resolveObjectStorageDownload(BBOS_PRODUCT_SLUG, ''), null)
    assert.equal(isUnavailableBbosAsset(null), true)
    assert.equal(isUnavailableBbosAsset(''), true)
  })

  it('resolves tools-bundle and individual tools', () => {
    const tools = resolveObjectStorageDownload(BBOS_PRODUCT_SLUG, 'tools-bundle')
    assert.ok(tools)
    assert.equal(tools!.objectPath, getBbosToolsBundleAsset().storageObjectPath)
    assert.equal(tools!.downloadFilename, 'BBOS-Tools-Bundle-v1.zip')

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

  it('fails closed for full-package while unavailable', () => {
    assert.equal(getBbosFullPackageAsset().available, false)
    assert.equal(isUnavailableBbosAsset('full-package'), true)
    assert.equal(resolveObjectStorageDownload(BBOS_PRODUCT_SLUG, 'full-package'), null)
  })

  it('returns null for unknown asset ids (route should 404)', () => {
    assert.equal(resolveObjectStorageDownload(BBOS_PRODUCT_SLUG, 'not-a-real-asset'), null)
    assert.equal(resolveObjectStorageDownload(BBOS_PRODUCT_SLUG, 'zip'), null)
  })

  it('does not resolve assets for non-BBOS slugs', () => {
    assert.equal(resolveObjectStorageDownload('some-other-product', 'calculator'), null)
  })
})
