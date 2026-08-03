/**
 *   npx tsx --test lib/__tests__/bbos-library-manifest.test.ts
 */
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import fs from 'fs'
import path from 'path'
import {
  BBOS_PRODUCT_SLUG,
  bbosDownloadHref,
  getAdjacentBbosModules,
  getBbosAssetByQueryId,
  getBbosFullPackageAsset,
  getBbosManifest,
  getBbosModuleByKey,
  getBbosToolsBundleAsset,
  isBbosProductSlug,
} from '../bbos-library-manifest'
import { loadBbosModuleMarkdown } from '../bbos-module-content'

describe('bbos-library-manifest', () => {
  it('exposes Phase One version metadata', () => {
    const m = getBbosManifest()
    assert.equal(m.productSlug, BBOS_PRODUCT_SLUG)
    assert.equal(m.version, '1.0.0')
    assert.equal(m.releaseLabel, 'Phase One')
    assert.match(m.updatePolicy, /Version 1\.x/)
    assert.equal(m.modules.length, 4)
  })

  it('allowlists only modules 1–4 and maps real files', () => {
    for (const mod of getBbosManifest().modules) {
      assert.ok(getBbosModuleByKey(mod.key))
      const abs = path.resolve(process.cwd(), mod.relativePath)
      assert.ok(fs.existsSync(abs), `missing ${mod.relativePath}`)
      assert.ok(!mod.relativePath.includes('blueprint'))
    }
    assert.equal(getBbosModuleByKey('module-05'), null)
    assert.equal(getBbosModuleByKey('../etc/passwd'), null)
    assert.equal(getBbosModuleByKey('module-01-business-foundation'), null)
  })

  it('loads allowlisted markdown and rejects blueprints', () => {
    const loaded = loadBbosModuleMarkdown('module-01')
    assert.ok(loaded)
    assert.match(loaded!.markdown, /Business Foundation/)
    assert.equal(loadBbosModuleMarkdown('module-01-blueprint'), null)
  })

  it('orders previous/next modules', () => {
    const first = getAdjacentBbosModules('module-01')
    assert.equal(first.prev, null)
    assert.equal(first.next?.key, 'module-02')
    const last = getAdjacentBbosModules('module-04')
    assert.equal(last.next, null)
    assert.equal(last.prev?.key, 'module-03')
  })

  it('separates tools-bundle from unavailable full-package', () => {
    const tools = getBbosToolsBundleAsset()
    assert.equal(tools.id, 'tools-bundle')
    assert.equal(tools.available, true)
    assert.equal(tools.customerFilename, 'BBOS-Tools-Bundle-v1.zip')
    assert.equal(
      tools.storageObjectPath,
      'bornfidis-business-operating-system/v1/bbos-tools-bundle-v1.zip',
    )
    assert.match(bbosDownloadHref(tools), /\?asset=tools-bundle/)

    const full = getBbosFullPackageAsset()
    assert.equal(full.id, 'full-package')
    assert.equal(full.available, false)
    assert.equal(full.customerFilename, 'Bornfidis-Business-Operating-System-v1.zip')
    assert.equal(
      full.storageObjectPath,
      'bornfidis-business-operating-system/v1/bornfidis-business-operating-system-v1.zip',
    )
  })

  it('resolves download asset query ids', () => {
    assert.ok(getBbosAssetByQueryId('calculator'))
    assert.ok(getBbosAssetByQueryId('weekly-rhythm-workbook'))
    assert.ok(getBbosAssetByQueryId('tools-bundle'))
    assert.ok(getBbosAssetByQueryId('full-package'))
    assert.equal(getBbosAssetByQueryId('unknown'), null)
    assert.equal(getBbosAssetByQueryId('zip'), null)
    const calc = getBbosAssetByQueryId('calculator')!
    assert.match(bbosDownloadHref(calc), /\?asset=calculator/)
    assert.ok(isBbosProductSlug(BBOS_PRODUCT_SLUG))
    assert.equal(isBbosProductSlug('llc-starter-kit'), false)
  })

  it('release notes do not claim a complete offline package is available', () => {
    const notes = getBbosManifest().releaseNotes.join(' ')
    assert.match(notes, /Tools Bundle/i)
    assert.match(notes, /not yet available/i)
    assert.ok(!/Download full package/i.test(notes))
  })
})
