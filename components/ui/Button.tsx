'use client'

import Link from 'next/link'
import type { ButtonHTMLAttributes, AnchorHTMLAttributes } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost'

const base =
  'inline-flex items-center justify-center font-semibold rounded-xl px-5 py-2.5 transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-forest focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed'

const variants: Record<ButtonVariant, string> = {
  primary:
    'bg-gold text-forest hover:opacity-90 hover:-translate-y-px active:translate-y-0',
  secondary:
    'border-2 border-forest text-forest hover:bg-forest hover:text-goldAccent hover:-translate-y-px active:translate-y-0',
  ghost:
    'text-forest hover:underline',
}

export interface ButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'> {
  variant?: ButtonVariant
  href?: string
  className?: string
  children: React.ReactNode
}

export function Button({
  variant = 'primary',
  href,
  className = '',
  children,
  type = 'button',
  disabled,
  ...rest
}: ButtonProps) {
  const classes = `${base} ${variants[variant]} ${className}`.trim()

  if (href) {
    return (
      <Link href={href} className={classes} {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)}>
        {children}
      </Link>
    )
  }

  return (
    <button type={type} disabled={disabled} className={classes} {...rest}>
      {children}
    </button>
  )
}
