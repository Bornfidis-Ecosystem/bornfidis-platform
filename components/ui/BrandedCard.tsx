import type { ReactNode } from 'react'

type BrandedCardProps = {
  children: ReactNode
  className?: string
  theme?: 'brutalist' | 'culinary'
}

/** Card shell for marketing / book sections */
export function BrandedCard({ children, className = '', theme }: BrandedCardProps) {
  const culinary = theme === 'culinary'
  const base = culinary
    ? 'rounded-none border border-gold/40 bg-bone p-6 shadow-none md:p-8'
    : 'rounded-sm border border-brass/25 bg-midnight/40 p-6 shadow-lg backdrop-blur-sm md:p-8'
  return <div className={`${base} ${className}`.trim()}>{children}</div>
}
