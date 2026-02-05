/**
 * Phase 2M — Minimal markdown-like rendering for education module content.
 * Supports: # heading, **bold**, paragraphs (double newline). Escapes HTML for safety.
 */

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function applyBold(escaped: string): string {
  return escaped.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
}

export function simpleMarkdownToHtml(text: string): string {
  if (!text?.trim()) return ''
  const paragraphs = text.split(/\n\n+/)
  const out: string[] = []
  for (const p of paragraphs) {
    const trimmed = p.trim()
    if (!trimmed) continue
    const safe = escapeHtml(trimmed)
    if (trimmed.startsWith('# ')) {
      out.push('<h2 class="text-lg font-semibold text-gray-900 mt-4 mb-2">' + applyBold(safe.slice(2)) + '</h2>')
    } else {
      out.push('<p class="text-gray-700 mb-2">' + applyBold(safe).replace(/\n/g, '<br/>') + '</p>')
    }
  }
  return out.join('')
}
