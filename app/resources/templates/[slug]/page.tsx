import Link from 'next/link'
import { notFound } from 'next/navigation'
import { TEMPLATES, TEMPLATE_CARD_FOOTER } from '@/lib/resources-data'
import TemplateCardIcon from '@/components/resources/TemplateCardIcon'

export const dynamic = 'force-dynamic'

const MICRO_TRUST = 'Built by Bornfidis • Practical • Jamaica-ready'

export default async function TemplateDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const template = TEMPLATES.find((t) => t.slug === slug)
  if (!template) notFound()

  return (
    <div className="min-h-screen bg-bone">
      <header className="text-white px-6 py-6 bg-navy">
        <Link
          href="/resources/templates"
          className="text-sm opacity-90 hover:underline"
        >
          ← Templates
        </Link>
        <div className="flex items-center justify-between gap-3 mt-2">
          <div className="flex flex-col gap-1">
            <span className="inline-flex rounded-none px-3 py-1 text-[10px] font-semibold uppercase tracking-wide shadow-sm w-fit bg-gold text-navy">
              {template.tag}
            </span>
            {template.tagSubtext && (
              <span className="text-xs opacity-90">{template.tagSubtext}</span>
            )}
            {template.alsoUsefulFor && !template.tagSubtext && (
              <span className="text-xs opacity-90">
                Also useful for: {template.alsoUsefulFor}
              </span>
            )}
          </div>
          <div className="w-10 h-10 rounded-none flex items-center justify-center border-2 border-gold text-gold shrink-0">
            <TemplateCardIcon slug={template.slug} className="shrink-0" />
          </div>
        </div>
        <h1 className="text-xl font-bold mt-3">{template.name}</h1>
      </header>

      <main className="max-w-xl mx-auto px-4 py-6">
        <div className="rounded-none p-5 mb-4 border border-[#E0DDD8] bg-white">
          <p className="text-charcoal">
            {template.problem}
          </p>
          {template.includes && template.includes.length > 0 && (
            <>
              <p className="text-sm font-medium mt-4 text-navy">
                What it includes:
              </p>
              <ul className="list-disc pl-5 text-sm mt-1 space-y-0.5 text-charcoal">
                {template.includes.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </>
          )}
          {template.purpose && (
            <p className="text-sm mt-3 text-gray-600">{template.purpose}</p>
          )}
          {template.whyItSells && (
            <p className="text-sm mt-2 italic text-gray-600">
              {template.whyItSells}
            </p>
          )}
          <p className="text-lg font-semibold mt-4 text-navy">
            {template.priceDisplay}
          </p>
          {template.valueNote && (
            <p className="text-sm text-gray-600 mt-1">{template.valueNote}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            {template.isBundle
              ? 'One download · All 5 templates + instructions'
              : template.isFree
                ? 'Free download'
                : 'One-time purchase · Instant download'}
          </p>
          <p className="text-xs text-gray-500 mt-3 pt-3 border-t border-[#E0DDD8]">
            {MICRO_TRUST}
          </p>
          <p className="text-xs text-gray-400 mt-2">
            {TEMPLATE_CARD_FOOTER}
          </p>
        </div>

        {/* CTA: Forest green with gold text */}
        <a
          href={`mailto:hello@bornfidis.com?subject=${template.isFree ? 'Free download' : 'Purchase'}: ${encodeURIComponent(template.name)}`}
          className="block w-full text-center rounded-none py-3 font-semibold hover:opacity-95 transition border-2 bg-navy text-gold border-gold"
        >
          {template.isFree ? 'Get free download' : 'Download'}
        </a>
        <p className="text-center text-xs text-gray-500 mt-2">
          You’ll get a confirmation and your file by email.
        </p>

        <p className="text-center pt-6">
          <Link
            href="/resources"
            className="text-sm font-medium hover:underline text-navy"
          >
            ← Back to Resources
          </Link>
        </p>
      </main>
    </div>
  )
}
