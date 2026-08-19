import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { stripeDivisionLabel, stripeDivisionShortHint } from '../stripe-division-labels'

describe('stripeDivisionLabel', () => {
  it('labels known Stripe accounts', () => {
    assert.equal(stripeDivisionLabel('provisions'), 'Provisions')
    assert.equal(stripeDivisionLabel('digital-studio'), 'Digital Studio')
    assert.equal(stripeDivisionLabel(null), 'Unlabeled')
    assert.equal(stripeDivisionLabel('sportswear'), 'Sportswear')
  })

  it('hints that Sportswear is not in the payment router', () => {
    assert.match(stripeDivisionShortHint('sportswear'), /not wired/i)
  })
})
