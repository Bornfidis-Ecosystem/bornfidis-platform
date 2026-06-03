import type { ReactNode } from 'react'

import { bookBody, bookEyebrow, bookHeadline } from '@/components/booking/book-culinary-classes'

type SectionHeadingProps = {
  eyebrow?: string
  title: string
  subtitle?: string
  align?: 'left' | 'center'
  className?: string
  titleClassName?: string
  theme?: 'brutalist' | 'culinary'
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = 'left',
  className = '',
  titleClassName = '',
  theme,
}: SectionHeadingProps) {
  const alignClass = align === 'center' ? 'text-center mx-auto' : ''
  const culinary = theme === 'culinary'
  return (
    <div className={`max-w-3xl ${alignClass} ${className}`.trim()}>
      {eyebrow ? (
        <p className={culinary ? bookEyebrow : 'mb-3 text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-brass'}>
          {eyebrow}
        </p>
      ) : null}
      <h2
        className={
          culinary
            ? `${bookHeadline} ${titleClassName}`.trim()
            : `font-display text-[clamp(1.75rem,4vw,2.75rem)] leading-tight tracking-tight text-cream ${titleClassName}`.trim()
        }
      >
        {title}
      </h2>
      {subtitle ? (
        <p className={culinary ? `mt-4 ${bookBody}` : 'mt-4 text-base leading-relaxed text-cream/70 md:text-lg'}>
          {subtitle}
        </p>
      ) : null}
    </div>
  )
}
