'use client'

import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react'
import Link from 'next/link'

const brutalistClass =
  'inline-flex min-h-[48px] items-center justify-center rounded-sm border border-brass/40 bg-brass/90 px-8 py-3 text-sm font-semibold text-midnight shadow-sm transition hover:bg-brass focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass'

const culinaryClass =
  'inline-flex min-h-[48px] items-center justify-center rounded-none border border-[#1A3C34] bg-[#1A3C34] px-8 py-3 font-sans text-[12px] font-semibold uppercase tracking-[0.1em] text-[#fdf8f8] shadow-none transition-colors duration-refined hover:bg-[#15352d] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C9A84C]'

type PrimaryButtonProps =
  | ({ href: string; children: ReactNode; className?: string; theme?: 'brutalist' | 'culinary' } & Omit<
      AnchorHTMLAttributes<HTMLAnchorElement>,
      'href' | 'className' | 'children'
    >)
  | ({ href?: undefined; children: ReactNode; className?: string; theme?: 'brutalist' | 'culinary' } & ButtonHTMLAttributes<HTMLButtonElement>)

export function PrimaryButton(props: PrimaryButtonProps) {
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
