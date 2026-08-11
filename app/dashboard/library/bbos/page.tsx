import { redirect } from 'next/navigation'
import Link from 'next/link'
import { checkAcademyEntitlement } from '@/lib/academy-entitlement'
import {
  BBOS_PRODUCT_SLUG,
  bbosDownloadHref,
  getBbosManifest,
} from '@/lib/bbos-library-manifest'
import { TrackedDownloadLink } from '@/components/academy/TrackedDownloadLink'
import { customerLoginHref } from '@/lib/safe-next-path'

export const dynamic = 'force-dynamic'

export default async function BbosLibraryHubPage() {
  const entitlement = await checkAcademyEntitlement(BBOS_PRODUCT_SLUG)

  if (!entitlement.ok) {
    if (entitlement.reason === 'unauthenticated') {
      redirect(customerLoginHref('/dashboard/library/bbos'))
    }
    if (entitlement.reason === 'error') {
      redirect('/dashboard/library')
    }
    redirect('/dashboard/library')
  }

  const m = getBbosManifest()
  const downloadableTools = m.assets.filter(
    (a) =>
      a.available &&
      (a.id === 'calculator' || a.id === 'weekly-rhythm-workbook' || a.id === 'tools-bundle'),
  )
  const fullPackage = m.assets.find((a) => a.id === 'full-package')!

  const downloadCtaLabel = (id: string) => {
    if (id === 'calculator') return 'Download pricing calculator'
    if (id === 'weekly-rhythm-workbook') return 'Download weekly rhythm workbook'
    if (id === 'tools-bundle') return 'Download tools bundle'
    return 'Download'
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
      <a
        href="#bbos-main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-white focus:px-3 focus:py-2 focus:text-forest"
      >
        Skip to content
      </a>

      <p className="mb-4">
        <Link
          href="/dashboard/library"
          className="text-sm font-semibold text-forest hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-forest"
        >
          ← Back to My Library
        </Link>
      </p>

      <header className="mb-10 border-b border-gray-200 pb-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-goldAccent">
          {m.releaseLabel} · Version {m.version}
        </p>
        <h1 className="mt-2 text-3xl font-bold text-forest sm:text-4xl">{m.title}</h1>
        <p className="mt-3 max-w-2xl text-gray-600">{m.description}</p>
        <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-600">
          <div>
            <dt className="inline font-semibold text-forest">Access: </dt>
            <dd className="inline">Entitled (purchased)</dd>
          </div>
          <div>
            <dt className="inline font-semibold text-forest">Last updated: </dt>
            <dd className="inline">{m.lastUpdated}</dd>
          </div>
        </dl>
      </header>

      <div id="bbos-main" className="space-y-12">
        <section aria-labelledby="bbos-start-here">
          <h2 id="bbos-start-here" className="text-xl font-bold text-forest">
            Start Here
          </h2>
          <div className="mt-4 space-y-3 text-gray-700">
            <p>
              <strong className="text-forest">What BBOS is.</strong> The Bornfidis Business
              Operating System is a practical guide for service-business owners. It helps you
              clarify the business, package what you sell, price with clear rules, and run a
              repeatable week. It is an operating system you install — not a set of income
              promises, and not legal, tax, accounting, or financial advice.
            </p>
            <p>
              <strong className="text-forest">Recommended starting order.</strong> Read Module 1
              first (foundation). Then Module 2 (offer and sales). Then Module 3 (pricing) with
              the Pricing &amp; Margin Calculator. Then Module 4 (weekly rhythm) with the Weekly
              Operating Rhythm Workbook. Do the exercises as you go.
            </p>
            <p>
              <strong className="text-forest">How to read modules online.</strong> Open a module
              below. Use the table of contents to jump within the page, and Previous / Next to
              move between modules. Your progress is not graded — work at a pace that fits a busy
              delivery week.
            </p>
            <p>
              <strong className="text-forest">How to download tools.</strong> Read Modules 1–4
              online in your BBOS Library. Download the calculator and workbook individually, or
              use the Tools Bundle to download both tools together. A complete offline package
              with module PDFs will be released separately when ready. Downloads require this
              same library access.
            </p>
            <p>
              <strong className="text-forest">How Version 1.x updates work.</strong>{' '}
              {m.updatePolicy} This does not include a future Version 2.
            </p>
          </div>
        </section>

        <section aria-labelledby="bbos-modules">
          <h2 id="bbos-modules" className="text-xl font-bold text-forest">
            Modules
          </h2>
          <ul className="mt-4 divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white">
            {m.modules.map((mod) => (
              <li key={mod.key}>
                <Link
                  href={`/dashboard/library/bbos/modules/${mod.key}`}
                  className="flex flex-col gap-1 px-4 py-4 transition hover:bg-card focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-forest sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <span className="font-bold text-forest">
                      Module {mod.number} — {mod.title}
                    </span>
                    <p className="text-sm text-gray-600">{mod.shortDescription}</p>
                  </div>
                  <span className="text-sm font-semibold text-forest shrink-0">Read →</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="bbos-tools">
          <h2 id="bbos-tools" className="text-xl font-bold text-forest">
            Downloadable tools
          </h2>
          <ul className="mt-4 space-y-3">
            {downloadableTools.map((asset) => (
              <li
                key={asset.id}
                className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <h3 className="font-semibold text-forest">{asset.label}</h3>
                  <p className="text-sm text-gray-600">{asset.description}</p>
                  <p className="mt-1 text-xs text-gray-500">{asset.customerFilename}</p>
                </div>
                <TrackedDownloadLink
                  href={bbosDownloadHref(asset)}
                  productSlug={BBOS_PRODUCT_SLUG}
                  productTitle={asset.label}
                  source="library"
                  className="inline-flex shrink-0 items-center justify-center rounded-xl bg-forest px-4 py-2 text-sm font-semibold text-goldAccent transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2"
                >
                  {downloadCtaLabel(asset.id)}
                </TrackedDownloadLink>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="bbos-full-package">
          <h2 id="bbos-full-package" className="text-xl font-bold text-forest">
            Full offline package
          </h2>
          <div className="mt-4 rounded-xl border border-dashed border-gray-300 bg-card p-4">
            <h3 className="font-semibold text-forest">{fullPackage.label}</h3>
            <p className="mt-1 text-sm text-gray-600">{fullPackage.description}</p>
            <p className="mt-3 text-sm font-medium text-gray-500">
              Full offline package — not yet available
            </p>
          </div>
        </section>

        <section aria-labelledby="bbos-policy">
          <h2 id="bbos-policy" className="text-xl font-bold text-forest">
            Version 1.x update policy
          </h2>
          <p className="mt-3 rounded-xl border border-goldAccent/40 bg-card p-4 text-gray-700">
            {m.updatePolicy}
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Access to a future Version 2 is not included and is not promised.
          </p>
        </section>

        <section aria-labelledby="bbos-notes">
          <h2 id="bbos-notes" className="text-xl font-bold text-forest">
            Release notes
          </h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-gray-700">
            {m.releaseNotes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-gray-500">Last updated: {m.lastUpdated}</p>
        </section>
      </div>
    </main>
  )
}
