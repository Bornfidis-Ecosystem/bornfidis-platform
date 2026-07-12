/**
 * Status classification for admin dashboard pipeline metrics.
 * Run: npx tsx --test lib/__tests__/admin-dashboard-metrics.test.ts
 */

import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  isNewLeadStatus,
  isQuotedStatus,
  normalizeStatus,
} from '../admin-dashboard-status'

describe('normalizeStatus', () => {
  it('lowercases and collapses spaces to underscores', () => {
    assert.equal(normalizeStatus('Quote Sent'), 'quote_sent')
    assert.equal(normalizeStatus('  New Inquiry  '), 'new_inquiry')
    assert.equal(normalizeStatus('NEW'), 'new')
  })
})

describe('isNewLeadStatus', () => {
  const positives = [
    'new',
    'NEW',
    'new_inquiry',
    'New Inquiry',
    'pending',
    'reviewed',
    'reviewing',
  ]

  for (const status of positives) {
    it(`counts "${status}" as a new lead`, () => {
      assert.equal(isNewLeadStatus(status), true)
    })
  }

  const negatives = ['confirmed', 'completed', 'cancelled', 'declined', 'quoted', 'quote_sent']

  for (const status of negatives) {
    it(`does not count "${status}" as a new lead`, () => {
      assert.equal(isNewLeadStatus(status), false)
    })
  }
})

describe('isQuotedStatus', () => {
  const positives = ['quoted', 'quote_sent', 'Quote Sent', 'QUOTE_SENT']

  for (const status of positives) {
    it(`counts "${status}" as quoted`, () => {
      assert.equal(isQuotedStatus(status), true)
    })
  }

  it('does not count new_inquiry as quoted', () => {
    assert.equal(isQuotedStatus('new_inquiry'), false)
  })
})
