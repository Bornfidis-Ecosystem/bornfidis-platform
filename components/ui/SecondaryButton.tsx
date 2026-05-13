'use client'

import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react'
import Link from 'next/link'

const baseClass =
  'inline-flex min-h-[48px] items-center justify-center rounded-sm border border-brass/35 bg-transparent px-8 py-3 text-sm font-medium text-cream transition hover:border-brass/60 hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass/50'

type SecondaryButtonProps =
  | ({ href: string; children: ReactNode; className?: string } & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'className' | 'children'>)
  | ({ href?: undefined; children: ReactNode; className?: string } & ButtonHTMLAttributes<HTMLButtonElement>)

export function SecondaryButton(props: SecondaryButtonProps) {
  const { children, className = '', ...rest } = props
  const cls = `${baseClass} ${className}`.trim()
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
