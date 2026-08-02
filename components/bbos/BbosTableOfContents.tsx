import type { BbosTocItem } from '@/lib/bbos-markdown'

type Props = {
  items: BbosTocItem[]
}

export function BbosTableOfContents({ items }: Props) {
  if (items.length === 0) return null

  return (
    <nav aria-label="On this page" className="bbos-toc">
      <details className="rounded-xl border border-gray-200 bg-white lg:border-0 lg:bg-transparent">
        <summary className="cursor-pointer list-none px-4 py-3 font-semibold text-forest lg:cursor-default lg:px-0 lg:py-0 lg:pointer-events-none [&::-webkit-details-marker]:hidden">
          <span className="lg:hidden">On this page</span>
          <span className="hidden lg:inline text-sm uppercase tracking-wide text-forest/80">
            On this page
          </span>
        </summary>
        <ol className="space-y-1 px-4 pb-4 pt-1 lg:mt-3 lg:px-0 lg:pb-0">
          {items.map((item) => (
            <li
              key={item.id}
              className={item.level === 3 ? 'ml-3' : ''}
            >
              <a
                href={`#${item.id}`}
                className="block rounded py-1 text-sm text-forest hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2"
              >
                {item.text}
              </a>
            </li>
          ))}
        </ol>
      </details>
    </nav>
  )
}
