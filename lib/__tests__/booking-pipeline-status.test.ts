/**
 * Pipeline status helpers for Milestone 1 — Pipeline Truth.
 * Run: npx tsx --test lib/__tests__/booking-pipeline-status.test.ts
 */

import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  canAdvanceToQuoteSent,
  canMarkPipelineCompleted,
  statusMatchesGroup,
  BOOKING_STATUS_GROUPS,
} from '../booking-pipeline-status'
import { getColumnIdForStatus, isExcludedFromPipelineBoard } from '../provisions-pipeline'

describe('canAdvanceToQuoteSent', () => {
  it('allows new / reviewing leads', () => {
    for (const s of ['new', 'New', 'new_inquiry', 'pending', 'reviewing', '']) {
      assert.equal(canAdvanceToQuoteSent(s), true, s)
    }
  })

  it('blocks confirmed, completed, cancelled, and awaiting_deposit', () => {
    for (const s of [
      'confirmed',
      'booked',
      'in_prep',
      'completed',
      'cancelled',
      'declined',
      'refunded',
      'awaiting_deposit',
    ]) {
      assert.equal(canAdvanceToQuoteSent(s), false, s)
    }
  })
})

describe('canMarkPipelineCompleted', () => {
  it('allows confirmed and quote_sent', () => {
    assert.equal(canMarkPipelineCompleted('confirmed'), true)
    assert.equal(canMarkPipelineCompleted('quote_sent'), true)
  })

  it('blocks cancelled / declined / refunded', () => {
    assert.equal(canMarkPipelineCompleted('cancelled'), false)
    assert.equal(canMarkPipelineCompleted('declined'), false)
    assert.equal(canMarkPipelineCompleted('refunded'), false)
  })
})

describe('Action Queue status groups', () => {
  it('recognizes quote_sent and confirmed', () => {
    assert.equal(statusMatchesGroup('quote_sent', BOOKING_STATUS_GROUPS.quoteSentLike), true)
    assert.equal(statusMatchesGroup('quoted', BOOKING_STATUS_GROUPS.quoteSentLike), true)
    assert.equal(statusMatchesGroup('confirmed', BOOKING_STATUS_GROUPS.confirmedLike), true)
    assert.equal(statusMatchesGroup('in_prep', BOOKING_STATUS_GROUPS.confirmedLike), true)
  })
})

describe('provisions pipeline New exclusion', () => {
  it('excludes cancelled and declined from the board', () => {
    assert.equal(isExcludedFromPipelineBoard('cancelled'), true)
    assert.equal(isExcludedFromPipelineBoard('declined'), true)
    assert.equal(getColumnIdForStatus('cancelled'), null)
    assert.equal(getColumnIdForStatus('declined'), null)
  })

  it('maps quote_sent and completed to the correct columns', () => {
    assert.equal(getColumnIdForStatus('quote_sent'), 'quote_sent')
    assert.equal(getColumnIdForStatus('quoted'), 'quote_sent')
    assert.equal(getColumnIdForStatus('completed'), 'completed')
    assert.equal(getColumnIdForStatus('new_inquiry'), 'new')
  })
})
