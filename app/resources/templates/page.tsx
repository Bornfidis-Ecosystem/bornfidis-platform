import Link from 'next/link'
import { TEMPLATES, TEMPLATE_CARD_FOOTER } from '@/lib/resources-data'
import TemplateCardIcon from '@/components/resources/TemplateCardIcon'
import { colors } from '@/lib/design-tokens'

export const dynamic = 'force-dynamic'

const CHARCOAL = '#1a1a1a'

const MICRO_TRUST = 'Built by Bornfidis • Practical • Jamaica-ready'

export default function TemplatesPage() {
  return (
    <div className="min-h-screen bg-card" style={{ backgroundColor: colors.card }}>
      <header
        className="text-white px-6 py-8 text-center bg-forest"
        style={{ backgroundColor: colors.forest }}
      >
        <h1 className="text-2xl font-bold">Templates</h1>
        <p className="text-sm mt-2 opacity-90">
          Ready-to-use documents
        </p>
      </header>

      <main className="max-w-xl mx-auto px-4 py-6 space-y-5">
        {TEMPLATES.map((t) => (
          <Link
            key={t.slug}
            href={`/resources/templates/${t.slug}`}
            className="block rounded-2xl p-5 transition hover:opacity-95 border border-[#e8e5dd]"
            style={{ backgroundColor: colors.card }}
          >
            {/* Top row: Tag pill (left) + Icon (right) */}
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="flex flex-col gap-1">
                <span className="inline-flex items-center rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wide shadow-sm w-fit bg-forest text-goldAccent">
                  {t.tag}
                </span>
                {t.tagSubtext && (
                  <span className="text-[10px] text-gray-500">
                    {t.tagSubtext}
                  </span>
                )}
                {t.alsoUsefulFor && !t.tagSubtext && (
                  <span className="text-[10px] text-gray-500">
                    Also useful for: {t.alsoUsefulFor}
                  </span>
                )}
              </div>
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center border-2 shrink-0"
                className="border-2 border-goldAccent text-goldAccent"
              >
                <TemplateCardIcon slug={t.slug} className="shrink-0" />
              </div>
            </div>

            {/* Title */}
            <h2
              className="text-lg font-bold leading-tight"
              className="text-forest"
            >
              {t.name}
            </h2>

            {/* Description */}
            <p
              className="text-sm mt-2 leading-snug"
              style={{ color: CHARCOAL }}
            >
              {t.problem}
            </p>

            {/* Price */}
            <p
              className="text-sm font-semibold mt-2"
              className="text-forest"
            >
              {t.priceDisplay}
            </p>
            {t.purpose && (
              <p className="text-xs mt-1 text-gray-600">{t.purpose}</p>
            )}

            {/* Learn more */}
            <p className="mt-3 text-sm font-medium" className="text-goldAccent">
              Learn more →
            </p>

            {/* Micro-trust */}
            <p className="text-xs mt-3 pt-3 border-t border-[#e8e5dd] text-gray-500">
              {MICRO_TRUST}
            </p>
            {/* Card footer (same on all) */}
            <p className="text-xs mt-2 text-gray-400">
              {TEMPLATE_CARD_FOOTER}
            </p>
          </Link>
        ))}

        <p className="text-center pt-4">
          <Link
            href="/resources"
            className="text-sm font-medium hover:underline"
            className="text-forest"
          >
            ← Back to Resources
          </Link>
        </p>
      </main>
    </div>
  )
}

