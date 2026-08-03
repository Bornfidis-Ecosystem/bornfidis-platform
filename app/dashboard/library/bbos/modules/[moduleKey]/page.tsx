import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { checkAcademyEntitlement } from '@/lib/academy-entitlement'
import {
  BBOS_PRODUCT_SLUG,
  getAdjacentBbosModules,
  getBbosModuleByKey,
} from '@/lib/bbos-library-manifest'
import { loadBbosModuleMarkdown } from '@/lib/bbos-module-content'
import { bbosMarkdownToHtml } from '@/lib/bbos-markdown'
import { BbosModuleBody } from '@/components/bbos/BbosModuleBody'
import { BbosTableOfContents } from '@/components/bbos/BbosTableOfContents'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ moduleKey: string }>
}

export default async function BbosModuleReaderPage({ params }: PageProps) {
  const { moduleKey } = await params

  // Reject unknown keys before entitlement to avoid leaking module existence? 
  // Prefer: auth first for consistency, then 404 for unknown — avoids probe difference.
  const entitlement = await checkAcademyEntitlement(BBOS_PRODUCT_SLUG)
  if (!entitlement.ok) {
    if (entitlement.reason === 'unauthenticated') {
      redirect(
        `/admin/login?next=${encodeURIComponent(`/dashboard/library/bbos/modules/${moduleKey}`)}`,
      )
    }
    redirect('/dashboard/library')
  }

  const allowed = getBbosModuleByKey(moduleKey)
  if (!allowed) {
    notFound()
  }

  const loaded = loadBbosModuleMarkdown(moduleKey)
  if (!loaded) {
    notFound()
  }

  const { prev, next } = getAdjacentBbosModules(moduleKey)
  const heading = `Module ${loaded.module.number} — ${loaded.module.title}`
  // Page chrome owns the single H1; skip the matching leading `#` from Markdown.
  const { html, toc } = bbosMarkdownToHtml(loaded.markdown, {
    skipLeadingH1Matching: heading,
  })

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <a
        href="#bbos-module-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-white focus:px-3 focus:py-2 focus:text-forest"
      >
        Skip to module content
      </a>

      <p className="mb-4">
        <Link
          href="/dashboard/library/bbos"
          className="text-sm font-semibold text-forest hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-forest"
        >
          ← Back to BBOS Library
        </Link>
      </p>

      <header className="mb-8 max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-goldAccent">
          BBOS · Phase One
        </p>
        <h1 className="mt-1 text-3xl font-bold text-forest">{heading}</h1>
      </header>

      <div className="grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)] lg:items-start">
        <aside className="lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)] lg:overflow-y-auto">
          <BbosTableOfContents items={toc} />
        </aside>

        <div id="bbos-module-content" className="min-w-0 max-w-3xl">
          <BbosModuleBody html={html} title={heading} />

          <nav
            aria-label="Module navigation"
            className="mt-12 flex flex-col gap-4 border-t border-gray-200 pt-8 sm:flex-row sm:items-center sm:justify-between"
          >
            {prev ? (
              <Link
                href={`/dashboard/library/bbos/modules/${prev.key}`}
                className="rounded-xl border border-forest px-4 py-3 text-sm font-semibold text-forest transition hover:bg-forest/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-forest"
              >
                ← Previous: Module {prev.number} — {prev.title}
              </Link>
            ) : (
              <span className="text-sm text-gray-400">Beginning of Phase One</span>
            )}
            {next ? (
              <Link
                href={`/dashboard/library/bbos/modules/${next.key}`}
                className="rounded-xl bg-forest px-4 py-3 text-sm font-semibold text-goldAccent transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2 sm:text-right"
              >
                Next: Module {next.number} — {next.title} →
              </Link>
            ) : (
              <span className="text-sm text-gray-400 sm:text-right">End of Phase One modules</span>
            )}
          </nav>
        </div>
      </div>
    </main>
  )
}
