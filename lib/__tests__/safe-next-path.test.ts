/**
 *   npx tsx --test lib/__tests__/safe-next-path.test.ts
 */
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  customerLoginHref,
  defaultAdminNext,
  isCustomerAppPath,
  safeNextPath,
} from '../safe-next-path'
import { resolveMagicLinkOrigin } from '../auth-callback-origin'

describe('safeNextPath', () => {
  it('allows internal relative paths', () => {
    assert.equal(safeNextPath('/dashboard/library'), '/dashboard/library')
    assert.equal(
      safeNextPath('/dashboard/library/bbos?x=1'),
      '/dashboard/library/bbos?x=1',
    )
  })

  it('rejects external and malformed next values', () => {
    assert.equal(safeNextPath('https://evil.com'), '/dashboard/library')
    assert.equal(safeNextPath('//evil.com'), '/dashboard/library')
    assert.equal(safeNextPath('///evil.com'), '/dashboard/library')
    assert.equal(safeNextPath('javascript:alert(1)'), '/dashboard/library')
    assert.equal(safeNextPath('\\/\\/evil.com'), '/dashboard/library')
    assert.equal(safeNextPath('%2F%2Fevil.com'), '/dashboard/library')
    assert.equal(safeNextPath('http://localhost:3000/dashboard'), '/dashboard/library')
  })

  it('uses provided fallback when invalid', () => {
    assert.equal(safeNextPath('https://x', '/admin'), '/admin')
  })
})

describe('customerLoginHref', () => {
  it('builds customer login with encoded next', () => {
    assert.equal(
      customerLoginHref('/dashboard/library'),
      '/account/login?next=%2Fdashboard%2Flibrary',
    )
  })

  it('sanitizes hostile next before encoding', () => {
    assert.equal(
      customerLoginHref('https://evil.com'),
      '/account/login?next=%2Fdashboard%2Flibrary',
    )
  })
})

describe('isCustomerAppPath / defaults', () => {
  it('classifies customer vs admin return paths', () => {
    assert.equal(isCustomerAppPath('/dashboard/library'), true)
    assert.equal(isCustomerAppPath('/academy/success'), true)
    assert.equal(isCustomerAppPath('/admin'), false)
    assert.equal(defaultAdminNext(), '/admin')
  })
})

describe('resolveMagicLinkOrigin', () => {
  it('allows localhost for local QA and pins production host', () => {
    assert.equal(resolveMagicLinkOrigin('http://localhost:3000'), 'http://localhost:3000')
    assert.equal(resolveMagicLinkOrigin('https://bornfidis.com'), 'https://bornfidis.com')
    assert.equal(resolveMagicLinkOrigin('https://evil.example'), 'https://bornfidis.com')
  })
})
