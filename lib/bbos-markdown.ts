/**
 * Safe BBOS Markdown → HTML for the Digital Studio library reader.
 * Escapes all HTML; supports headings, lists, tables, blockquotes/callouts,
 * code fences, hr, emphasis. No raw HTML passthrough.
 */

export type BbosTocItem = {
  id: string
  text: string
  level: 2 | 3
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/<[^>]+>/g, '')
    .replace(/&[a-z]+;/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80)
}

/** Inline: code, bold, italic, links (http/https only). */
function renderInline(raw: string): string {
  let s = escapeHtml(raw)

  // Inline code first
  s = s.replace(/`([^`]+)`/g, '<code class="bbos-code-inline">$1</code>')

  // Bold then italic
  s = s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  s = s.replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, '<em>$1</em>')
  s = s.replace(/_(.+?)_/g, '<em>$1</em>')

  // Links — allow http/https/mailto only
  s = s.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    (_m, label: string, href: string) => {
      const trimmed = href.trim()
      if (!/^(https?:|mailto:)/i.test(trimmed)) {
        return label
      }
      const safeHref = escapeHtml(trimmed)
      return `<a href="${safeHref}" class="bbos-link" rel="noopener noreferrer">${label}</a>`
    },
  )

  return s
}

const CALLOUT_RE = /^\*\*(NOTE|TIP|WARNING|DO THIS NOW|EXAMPLE)(?:\s*[—-]\s*(.+))?\*\*\s*$/i

function calloutClass(kind: string): string {
  const k = kind.toUpperCase()
  if (k === 'WARNING') return 'bbos-callout bbos-callout-warning'
  if (k === 'TIP') return 'bbos-callout bbos-callout-tip'
  if (k === 'DO THIS NOW') return 'bbos-callout bbos-callout-action'
  if (k === 'EXAMPLE') return 'bbos-callout bbos-callout-example'
  return 'bbos-callout bbos-callout-note'
}

function parseTable(rows: string[]): string {
  if (rows.length < 2) return rows.map((r) => `<p>${renderInline(r)}</p>`).join('')
  const split = (line: string) =>
    line
      .replace(/^\|/, '')
      .replace(/\|$/, '')
      .split('|')
      .map((c) => c.trim())

  const header = split(rows[0])
  const sep = rows[1]?.trim() ?? ''
  if (!/^\|?[\s:|-]+\|?$/.test(sep)) {
    return rows.map((r) => `<p>${renderInline(r)}</p>`).join('')
  }

  const bodyRows = rows.slice(2).map(split)
  const thead =
    '<thead><tr>' +
    header.map((h) => `<th scope="col">${renderInline(h)}</th>`).join('') +
    '</tr></thead>'
  const tbody =
    '<tbody>' +
    bodyRows
      .map(
        (cells) =>
          '<tr>' + cells.map((c) => `<td>${renderInline(c)}</td>`).join('') + '</tr>',
      )
      .join('') +
    '</tbody>'
  return `<div class="bbos-table-wrap"><table class="bbos-table">${thead}${tbody}</table></div>`
}

export function extractBbosToc(markdown: string): BbosTocItem[] {
  const toc: BbosTocItem[] = []
  const seen = new Map<string, number>()
  for (const line of markdown.split(/\r?\n/)) {
    const m = /^(#{2,3})\s+(.+)$/.exec(line)
    if (!m) continue
    const level = m[1].length as 2 | 3
    const text = m[2].replace(/\*\*/g, '').trim()
    let id = slugify(text) || 'section'
    const n = (seen.get(id) ?? 0) + 1
    seen.set(id, n)
    if (n > 1) id = `${id}-${n}`
    toc.push({ id, text, level })
  }
  return toc
}

export function bbosMarkdownToHtml(markdown: string): { html: string; toc: BbosTocItem[] } {
  const toc = extractBbosToc(markdown)
  const tocIds = toc.map((t) => t.id)
  let tocIdx = 0

  const lines = markdown.replace(/\r\n/g, '\n').split('\n')
  const out: string[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    // Fenced code
    if (line.startsWith('```')) {
      const lang = escapeHtml(line.slice(3).trim())
      i += 1
      const buf: string[] = []
      while (i < lines.length && !lines[i].startsWith('```')) {
        buf.push(escapeHtml(lines[i]))
        i += 1
      }
      if (i < lines.length) i += 1
      out.push(
        `<pre class="bbos-pre"${lang ? ` data-lang="${lang}"` : ''}><code>${buf.join('\n')}</code></pre>`,
      )
      continue
    }

    // HR
    if (/^(-{3,}|\*{3,}|_{3,})\s*$/.test(line)) {
      out.push('<hr class="bbos-hr" />')
      i += 1
      continue
    }

    // Headings
    const hm = /^(#{1,3})\s+(.+)$/.exec(line)
    if (hm) {
      const level = hm[1].length
      const text = hm[2].trim()
      const tag = `h${level}`
      let idAttr = ''
      if (level >= 2 && tocIdx < tocIds.length) {
        idAttr = ` id="${tocIds[tocIdx]}"`
        tocIdx += 1
      }
      out.push(
        `<${tag}${idAttr} class="bbos-h${level}">${renderInline(text)}</${tag}>`,
      )
      i += 1
      continue
    }

    // Table (separator uses dashes; keep '-' at end of class to avoid range bugs)
    if (
      line.includes('|') &&
      i + 1 < lines.length &&
      /^\|?[\s:|-]+$/.test(lines[i + 1].trim())
    ) {
      const tableLines: string[] = []
      while (i < lines.length && lines[i].includes('|')) {
        tableLines.push(lines[i])
        i += 1
      }
      out.push(parseTable(tableLines))
      continue
    }

    // Blockquote / callout
    if (line.startsWith('>')) {
      const quoteLines: string[] = []
      while (i < lines.length && lines[i].startsWith('>')) {
        quoteLines.push(lines[i].replace(/^>\s?/, ''))
        i += 1
      }
      const first = quoteLines[0]?.trim() ?? ''
      const cm = CALLOUT_RE.exec(first)
      if (cm) {
        const kind = cm[1].toUpperCase()
        const subtitle = cm[2]?.trim()
        const body = quoteLines.slice(1).join('\n').trim()
        const label = subtitle ? `${kind} — ${escapeHtml(subtitle)}` : kind
        out.push(
          `<aside class="${calloutClass(kind)}" role="note">` +
            `<p class="bbos-callout-label">${label}</p>` +
            (body
              ? body
                  .split(/\n\n+/)
                  .map((p) => `<p>${renderInline(p.replace(/\n/g, ' '))}</p>`)
                  .join('')
              : '') +
            `</aside>`,
        )
      } else {
        const body = quoteLines.join('\n')
        out.push(
          `<blockquote class="bbos-blockquote">${body
            .split(/\n\n+/)
            .map((p) => `<p>${renderInline(p.replace(/\n/g, ' '))}</p>`)
            .join('')}</blockquote>`,
        )
      }
      continue
    }

    // Unordered list
    if (/^\s*[-*]\s+/.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*[-*]\s+/, ''))
        i += 1
      }
      out.push(
        '<ul class="bbos-ul">' +
          items.map((it) => `<li>${renderInline(it)}</li>`).join('') +
          '</ul>',
      )
      continue
    }

    // Ordered list
    if (/^\s*\d+\.\s+/.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*\d+\.\s+/, ''))
        i += 1
      }
      out.push(
        '<ol class="bbos-ol">' +
          items.map((it) => `<li>${renderInline(it)}</li>`).join('') +
          '</ol>',
      )
      continue
    }

    // Blank
    if (!line.trim()) {
      i += 1
      continue
    }

    // Paragraph (consume until blank)
    const para: string[] = [line]
    i += 1
    while (i < lines.length && lines[i].trim() && !/^(#{1,3}\s|>|```|\s*[-*]\s|\s*\d+\.\s|(-{3,}|\*{3,}))/.test(lines[i]) && !lines[i].includes('|')) {
      para.push(lines[i])
      i += 1
    }
    out.push(`<p class="bbos-p">${renderInline(para.join(' '))}</p>`)
  }

  return { html: out.join('\n'), toc }
}
