import type { ElementType, HTMLAttributes, ReactNode } from 'react'

type CulinaryCardProps = {
  as?: ElementType
  children: ReactNode
  className?: string
  padded?: boolean
} & Omit<HTMLAttributes<HTMLElement>, 'className'>

/**
 * Sharp-edged surface — 1px outline, no shadow (Culinary OS / DESIGN.md).
 */
export function CulinaryCard({
  as: Component = 'div',
  children,
  className = '',
  padded = true,
  ...rest
}: CulinaryCardProps) {
  const pad = padded ? 'p-gutter' : ''
  return (
    <Component
      className={`rounded-none border border-culinary-outline bg-culinary-bone shadow-none ${pad} ${className}`.trim()}
      {...rest}
    >
      {children}
    </Component>
  )
}
