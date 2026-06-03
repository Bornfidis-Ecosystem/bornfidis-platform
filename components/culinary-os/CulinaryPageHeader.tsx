import type { ReactNode } from 'react'

type CulinaryPageHeaderProps = {
  title: string
  description?: string
  actions?: ReactNode
  className?: string
}

/**
 * Page-level editorial header inside the main canvas.
 */
export function CulinaryPageHeader({
  title,
  description,
  actions,
  className = '',
}: CulinaryPageHeaderProps) {
  return (
    <header
      className={`flex flex-col gap-stack-md border-b border-culinary-outline-variant pb-stack-lg md:flex-row md:items-end md:justify-between ${className}`.trim()}
    >
      <div className="min-w-0 space-y-stack-sm">
        <h1 className="font-culinary-display text-headline-lg tracking-tight text-culinary-navy md:text-headline-xl">
          {title}
        </h1>
        {description && (
          <p className="max-w-2xl font-culinary-sans text-[14px] leading-relaxed text-culinary-text-muted md:text-[16px] md:leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap gap-3">{actions}</div> : null}
    </header>
  )
}
