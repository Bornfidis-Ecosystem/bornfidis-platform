/**
 * Date-only parsing / expiry helpers.
 * Run with Eastern TZ:
 *   TZ=America/New_York npx tsx --test lib/__tests__/date-utils.test.ts
 * Windows PowerShell:
 *   $env:TZ='America/New_York'; npx tsx --test lib/__tests__/date-utils.test.ts
 */

import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  daysUntilDateOnlyEnd,
  endOfLocalDateOnly,
  formatDateOnly,
  isDateOnlyExpired,
  parseLocalDateOnly,
} from '../date-utils'

describe('parseLocalDateOnly', () => {
  it('parses YYYY-MM-DD as local calendar components', () => {
    const d = parseLocalDateOnly('2026-10-01')
    assert.equal(d.getFullYear(), 2026)
    assert.equal(d.getMonth(), 9) // October
    assert.equal(d.getDate(), 1)
  })

  it('falls back for full ISO timestamps', () => {
    const d = parseLocalDateOnly('2026-10-01T15:30:00.000Z')
    assert.equal(Number.isNaN(d.getTime()), false)
  })
})

describe('formatDateOnly', () => {
  it('formats 2026-10-01 as October 1, not September 30', () => {
    const formatted = formatDateOnly('2026-10-01', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
    assert.match(formatted, /October/)
    assert.match(formatted, /1/)
    assert.doesNotMatch(formatted, /September/)
  })
})

describe('isDateOnlyExpired', () => {
  it('is not expired at local noon on the expiry day', () => {
    const noon = new Date(2026, 9, 1, 12, 0, 0, 0)
    assert.equal(isDateOnlyExpired('2026-10-01', noon), false)
  })

  it('is not expired at 11:59:59 PM on the expiry day', () => {
    const almostMidnight = new Date(2026, 9, 1, 23, 59, 59, 0)
    assert.equal(isDateOnlyExpired('2026-10-01', almostMidnight), false)
  })

  it('is expired on the next calendar day', () => {
    const nextDay = new Date(2026, 9, 2, 0, 0, 0, 0)
    assert.equal(isDateOnlyExpired('2026-10-01', nextDay), true)
  })
})

describe('endOfLocalDateOnly / daysUntilDateOnlyEnd', () => {
  it('ends at 23:59:59.999 local on that day', () => {
    const end = endOfLocalDateOnly('2026-10-01')
    assert.equal(end.getFullYear(), 2026)
    assert.equal(end.getMonth(), 9)
    assert.equal(end.getDate(), 1)
    assert.equal(end.getHours(), 23)
    assert.equal(end.getMinutes(), 59)
    assert.equal(end.getSeconds(), 59)
    assert.equal(end.getMilliseconds(), 999)
  })

  it('reports positive days remaining before end of expiry day', () => {
    const noon = new Date(2026, 9, 1, 12, 0, 0, 0)
    const days = daysUntilDateOnlyEnd('2026-10-01', noon)
    assert.ok(days > 0 && days < 1)
  })
})
