'use client'

import Link from 'next/link'

interface CardProps {
  children: React.ReactNode
  className?: string
  as?: 'div' | 'article'
  href?: string
}

const cardClass =
  'rounded-2xl border border-gray-200 bg-white p-6 shadow-md transition-all duration-200 ease-in-out hover:shadow-lg hover:border-goldAccent/40'

export function Card({ children, className = '', as: As = 'div', href }: CardProps) {
  const combined = `${cardClass} ${className}`.trim()

  if (href) {
    return (
      <Link href={href} className={`block group ${combined}`}>
        {children}
      </Link>
    )
  }

  return <As className={combined}>{children}</As>
}
