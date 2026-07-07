'use client'

import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react'
import Link from 'next/link'

const brutalistClass =
  'inline-flex min-h-[48px] items-center justify-center rounded-sm border border-brass/40 bg-brass/90 px-8 py-3 text-sm font-semibold text-midnight shadow-sm transition hover:bg-brass focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass'

const culinaryClass =
  'inline-flex min-h-[48px] items-center justify-center rounded-none border border-[#002747] bg-[#002747] px-8 py-3 font-sans text-[12px] font-semibold uppercase tracking-[0.1em] text-[#faf6f0] shadow-none transition-colors duration-refined hover:bg-[#001528] active:bg-[#001528] active:text-[#ffbc00] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ffbc00]'

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
