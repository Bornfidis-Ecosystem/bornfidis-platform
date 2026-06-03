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
    ? 'rounded-none border border-[#C9A84C]/40 bg-[#fdf8f8] p-6 shadow-none md:p-8'
    : 'rounded-sm border border-brass/25 bg-midnight/40 p-6 shadow-lg backdrop-blur-sm md:p-8'
  return <div className={`${base} ${className}`.trim()}>{children}</div>
}
