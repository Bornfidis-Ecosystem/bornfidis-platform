/**
 *   npx tsx --test lib/__tests__/bbos-markdown.test.ts
 */
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { bbosMarkdownToHtml, extractBbosToc } from '../bbos-markdown'

describe('bbos-markdown', () => {
  it('escapes raw HTML', () => {
    const { html } = bbosMarkdownToHtml('Hello <script>alert(1)</script>')
    assert.ok(!html.includes('<script>'))
    assert.ok(html.includes('&lt;script&gt;'))
  })

  it('renders headings, lists, tables, and callouts', () => {
    const md = `# Title

## Chapter One

### Detail

- Item one
- Item two

> **TIP**
> Do the short thing.

| A | B |
|---|---|
| 1 | 2 |
`
    const { html, toc } = bbosMarkdownToHtml(md)
    assert.ok(html.includes('bbos-h1'))
    assert.ok(html.includes('bbos-h2'))
    assert.ok(html.includes('bbos-ul'))
    assert.ok(html.includes('bbos-callout'))
    assert.ok(html.includes('TIP'))
    assert.ok(html.includes('bbos-table'))
    assert.ok(toc.some((t) => t.text === 'Chapter One'))
  })

  it('blocks javascript: links', () => {
    const { html } = bbosMarkdownToHtml('[x](javascript:alert(1))')
    assert.ok(!html.includes('javascript:'))
  })

  it('builds unique toc ids', () => {
    const toc = extractBbosToc('## Same\n\n## Same\n')
    assert.equal(toc.length, 2)
    assert.notEqual(toc[0].id, toc[1].id)
  })

  it('skips a matching leading H1 when requested (module reader chrome)', () => {
    const md = `# Module 1 — Business Foundation

*Subtitle*

## Module purpose

Body.
`
    const { html, toc } = bbosMarkdownToHtml(md, {
      skipLeadingH1Matching: 'Module 1 — Business Foundation',
    })
    assert.ok(!html.includes('bbos-h1'))
    assert.ok(!html.includes('<h1'))
    assert.ok(html.includes('bbos-h2'))
    assert.ok(html.includes('Module purpose'))
    assert.ok(html.includes('Subtitle'))
    assert.equal(toc[0]?.text, 'Module purpose')
  })

  it('keeps leading H1 when skip text does not match', () => {
    const { html } = bbosMarkdownToHtml('# Module 1 — Business Foundation\n\n## Next\n', {
      skipLeadingH1Matching: 'Some Other Title',
    })
    assert.ok(html.includes('bbos-h1'))
  })
})
