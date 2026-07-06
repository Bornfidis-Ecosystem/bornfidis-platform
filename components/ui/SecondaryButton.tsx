'use client'

import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react'
import Link from 'next/link'

const brutalistClass =
  'inline-flex min-h-[48px] items-center justify-center rounded-sm border border-brass/35 bg-transparent px-8 py-3 text-sm font-medium text-cream transition hover:border-brass/60 hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass/50'

const culinaryClass =
  'inline-flex min-h-[48px] items-center justify-center rounded-none border border-[#1a1a1a] bg-transparent px-8 py-3 font-sans text-[12px] font-semibold uppercase tracking-[0.1em] text-[#1a1a1a] shadow-none transition-colors duration-refined hover:border-[#ffbc00] hover:text-[#1a1a1a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ffbc00]'

type SecondaryButtonProps =
  | ({ href: string; children: ReactNode; className?: string; theme?: 'brutalist' | 'culinary' } & Omit<
      AnchorHTMLAttributes<HTMLAnchorElement>,
      'href' | 'className' | 'children'
    >)
  | ({ href?: undefined; children: ReactNode; className?: string; theme?: 'brutalist' | 'culinary' } & ButtonHTMLAttributes<HTMLButtonElement>)

export function SecondaryButton(props: SecondaryButtonProps) {
  const { children, className = '', theme, ...rest } = props
  const base = theme === 'culinary' ? culinaryClass : brutalistClass
  const cls = `${base} ${className}`.trim()
  if ('href' in props && props.href) {
    const { href, ...a } = rest as AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }
    return (
      <Link href={href} className={cls} {...a}>
        {children}
      </Link>
    )
  }
  return (
    <button className={cls} {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}>
      {children}
    </button>
  )
}
