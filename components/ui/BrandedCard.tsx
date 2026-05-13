import type { ReactNode } from 'react'

/** Dark “luxury” card for marketing / book pages on deep green */
export function BrandedCard({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-sm border border-brass/25 bg-midnight/40 p-6 shadow-lg backdrop-blur-sm md:p-8 ${className}`.trim()}
    >
      {children}
    </div>
  )
}
