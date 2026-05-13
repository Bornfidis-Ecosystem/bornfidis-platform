'use client'

import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react'
import Link from 'next/link'

const baseClass =
  'inline-flex min-h-[48px] items-center justify-center rounded-sm border border-brass/40 bg-brass/90 px-8 py-3 text-sm font-semibold text-midnight shadow-sm transition hover:bg-brass focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass'

type PrimaryButtonProps =
  | ({ href: string; children: ReactNode; className?: string } & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'className' | 'children'>)
  | ({ href?: undefined; children: ReactNode; className?: string } & ButtonHTMLAttributes<HTMLButtonElement>)

export function PrimaryButton(props: PrimaryButtonProps) {
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
