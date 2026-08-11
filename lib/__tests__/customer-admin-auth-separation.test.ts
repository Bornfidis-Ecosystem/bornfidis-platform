/**
 *   npx tsx --test lib/__tests__/customer-admin-auth-separation.test.ts
 *
 * Policy tests: customer magic-link has no allowlist; admin magic-link does.
 */
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { customerLoginHref } from '../safe-next-path'
import { isUnavailableBbosAsset, resolveObjectStorageDownload } from '../academy-object-storage'
import { BBOS_PRODUCT_SLUG } from '../bbos-library-manifest'

const root = join(process.cwd())

describe('customer vs admin auth separation (source policy)', () => {
  it('customer magic-link route does not use admin allowlist', () => {
    const src = readFileSync(
      join(root, 'app/api/account/auth/magic-link/route.ts'),
      'utf8',
    )
    assert.match(src, /generateCustomerMagicLink/)
    assert.doesNotMatch(src, /canReceiveAdminMagicLink/)
    assert.doesNotMatch(src, /isAllowedAdminEmail/)
  })

  it('admin magic-link route still uses allowlist', () => {
    const src = readFileSync(join(root, 'app/api/admin/auth/magic-link/route.ts'), 'utf8')
    assert.match(src, /canReceiveAdminMagicLink/)
  })

  it('library and downloads redirect unauthenticated users to customer login', () => {
    const library = readFileSync(join(root, 'app/dashboard/library/page.tsx'), 'utf8')
    const hub = readFileSync(join(root, 'app/dashboard/library/bbos/page.tsx'), 'utf8')
    const modulePage = readFileSync(
      join(root, 'app/dashboard/library/bbos/modules/[moduleKey]/page.tsx'),
      'utf8',
    )
    const download = readFileSync(
      join(root, 'app/api/academy/download/[slug]/route.ts'),
      'utf8',
    )
    const buy = readFileSync(join(root, 'components/academy/AcademyBuyButton.tsx'), 'utf8')

    for (const src of [library, hub, modulePage, download, buy]) {
      assert.match(src, /customerLoginHref|\/account\/login/)
      assert.doesNotMatch(src, /\/admin\/login\?next=/)
    }
  })

  it('preserves library return path shape', () => {
    assert.equal(
      customerLoginHref('/dashboard/library'),
      '/account/login?next=%2Fdashboard%2Flibrary',
    )
  })
})

describe('BBOS entitlement download policy (unchanged)', () => {
  it('tools resolve; full package stays unavailable', () => {
    assert.ok(resolveObjectStorageDownload(BBOS_PRODUCT_SLUG, 'calculator'))
    assert.ok(resolveObjectStorageDownload(BBOS_PRODUCT_SLUG, 'tools-bundle'))
    assert.equal(resolveObjectStorageDownload(BBOS_PRODUCT_SLUG, 'full-package'), null)
    assert.equal(isUnavailableBbosAsset('full-package'), true)
    assert.equal(isUnavailableBbosAsset(''), true)
  })
})
