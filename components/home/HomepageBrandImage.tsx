import Image from 'next/image'
import type { ReactNode } from 'react'

type Props = {
  src: string | null
  alt: string
  /** Shown when `src` is null — omit when `src` is always set */
  fallback?: ReactNode
  /** LCP candidate — use only for above-the-fold hero */
  priority?: boolean
  className?: string
  /** hero: forest hero | section: cards | banner: wide transition strip */
  variant?: 'hero' | 'section' | 'banner'
}

/** Scrim uses Midnight + Jamaica green (brand tokens as rgba) for legibility on photography */
const SCRIM_HERO =
  'pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,rgba(13,31,45,0.5)_0%,rgba(46,107,79,0.12)_42%,rgba(0,0,0,0.08)_62%,transparent_78%)]'
const SCRIM_BANNER =
  'pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,rgba(13,31,45,0.28)_0%,transparent_58%,transparent_100%)]'
const SCRIM_SECTION =
  'pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,rgba(13,31,45,0.48)_0%,rgba(46,107,79,0.14)_38%,transparent_72%)]'

export function HomepageBrandImage({
  src,
  alt,
  fallback,
  priority = false,
  className = '',
  variant = 'section',
}: Props) {
  if (!src) {
    return <>{fallback ?? null}</>
  }

  const border =
    variant === 'hero'
      ? 'border border-white/15 shadow-[0_24px_80px_-24px_rgba(0,0,0,0.55)]'
      : 'border border-gold/15'

  const imageClass =
    variant === 'hero'
      ? 'object-cover object-top'
      : variant === 'banner'
        ? 'object-cover object-center'
        : 'object-cover'

  const scrimClass =
    variant === 'hero' ? SCRIM_HERO : variant === 'banner' ? SCRIM_BANNER : SCRIM_SECTION

  const innerClass =
    variant === 'banner'
      ? 'relative aspect-[21/9] min-h-[220px] w-full max-h-[min(52vh,560px)] sm:min-h-[260px]'
      : 'relative aspect-[4/5] w-full sm:aspect-[3/4] lg:aspect-[5/6]'

  const sizes =
    variant === 'banner'
      ? '(max-width: 1024px) 100vw, min(1280px, 100vw)'
      : '(max-width: 1024px) 100vw, 42vw'

  return (
    <div className={`relative overflow-hidden rounded-3xl bg-midnight ${border} ${className}`}>
      <div className={innerClass}>
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          sizes={sizes}
          className={imageClass}
        />
        <div className={scrimClass} aria-hidden />
      </div>
    </div>
  )
}
