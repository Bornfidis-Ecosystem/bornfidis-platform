import type { ReactNode } from 'react'

const stackClass = {
  sm: 'space-y-stack-sm',
  md: 'space-y-stack-md',
  lg: 'space-y-stack-lg',
  xl: 'space-y-stack-xl',
} as const

type CulinarySectionSpacing = keyof typeof stackClass

type CulinarySectionProps = {
  children: ReactNode
  /** Small caps label above title */
  eyebrow?: string
  title?: string
  /** Semantic heading level for title */
  titleLevel?: 2 | 3
  id?: string
  spacing?: CulinarySectionSpacing
  className?: string
}

/**
 * Vertical rhythm + editorial pacing (cinematic whitespace).
 */
export function CulinarySection({
  children,
  eyebrow,
  title,
  titleLevel = 2,
  id,
  spacing = 'xl',
  className = '',
}: CulinarySectionProps) {
  const HeadingTag = titleLevel === 2 ? 'h2' : 'h3'
  const titleId = id ?? (title ? title.toLowerCase().replace(/\s+/g, '-') : undefined)

  return (
    <section
      className={`${stackClass[spacing]} ${className}`.trim()}
      aria-labelledby={title && titleId ? titleId : undefined}
    >
      {eyebrow && (
        <p className="font-culinary-sans text-[12px] font-bold uppercase leading-snug tracking-[0.1em] text-culinary-text-muted">
          {eyebrow}
        </p>
      )}
      {title && (
        <HeadingTag
          id={titleId}
          className="font-culinary-display text-headline-lg tracking-tight text-culinary-navy md:text-[2rem] md:leading-snug"
        >
          {title}
        </HeadingTag>
      )}
      {children}
    </section>
  )
}
