import './bbos-reader.css'

type Props = {
  html: string
  title: string
}

/** Renders sanitized BBOS HTML produced by bbosMarkdownToHtml. */
export function BbosModuleBody({ html, title }: Props) {
  return (
    <article
      className="bbos-reader"
      aria-label={title}
      // HTML is produced by lib/bbos-markdown.ts with full escaping — no raw HTML from source.
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
