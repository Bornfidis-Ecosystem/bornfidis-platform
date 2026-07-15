import Link from 'next/link'

import { PHASE1_CTA } from '@/lib/phase1-marketing'

import './conversion-cta.css'

type Variant = 'bone' | 'forest'

type ConversionCtaBandProps = {
  variant?: Variant
  compact?: boolean
  eyebrow?: string
  title?: string
  body?: string
  className?: string
}

/**
 * Standard Phase 1 conversion block — one primary action (book dining), three secondary paths.
 */
export function ConversionCtaBand({
  variant = 'bone',
  compact = false,
  eyebrow = 'Next step',
  title = 'Ready to start a conversation?',
  body = 'Tell us about your table, your kitchen, or your next gathering. We respond within 24 hours.',
  className = '',
}: ConversionCtaBandProps) {
  const variantClass = variant === 'forest' ? 'bf-conversion-cta--forest' : 'bf-conversion-cta--bone'
  const compactClass = compact ? 'bf-conversion-cta--compact' : ''

  return (
    <section
      className={`bf-conversion-cta ${variantClass} ${compactClass} ${className}`.trim()}
      aria-labelledby="conversion-cta-title"
    >
      <div className="bf-conversion-cta__inner">
        {eyebrow ? <p className="bf-conversion-cta__eyebrow">{eyebrow}</p> : null}
        <h2 id="conversion-cta-title" className="bf-conversion-cta__title">
          {title}
        </h2>
        {body ? <p className="bf-conversion-cta__body">{body}</p> : null}
        <Link href={PHASE1_CTA.bookPrivateDining.href} className="bf-conversion-cta__primary">
          {PHASE1_CTA.bookPrivateDining.label}
        </Link>
        <div className="bf-conversion-cta__secondary">
          <Link href={PHASE1_CTA.requestProduct.href} className="bf-conversion-cta__link">
            {PHASE1_CTA.requestProduct.label}
          </Link>
          <Link href={PHASE1_CTA.bookCookingClass.href} className="bf-conversion-cta__link">
            {PHASE1_CTA.bookCookingClass.label}
          </Link>
          <Link href={PHASE1_CTA.applyDigitalStudio.href} className="bf-conversion-cta__link">
            {PHASE1_CTA.applyDigitalStudio.label}
          </Link>
          <Link href={PHASE1_CTA.contactBornfidis.href} className="bf-conversion-cta__link">
            {PHASE1_CTA.contactBornfidis.label}
          </Link>
        </div>
      </div>
    </section>
  )
}
