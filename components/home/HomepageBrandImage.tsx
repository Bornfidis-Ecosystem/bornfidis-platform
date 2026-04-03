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
      ? 'border border-white/20 shadow-lg shadow-black/20'
      : 'border border-[#E8E1D2]'

  const imageClass =
    variant === 'hero'
      ? 'object-cover object-top'
      : variant === 'banner'
        ? 'object-cover object-center'
        : 'object-cover'

  const scrimClass =
    variant === 'hero'
      ? 'pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,rgba(15,61,46,0.42)_0%,rgba(0,0,0,0.12)_38%,transparent_65%)]'
      : variant === 'banner'
        ? 'pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,rgba(15,61,46,0.2)_0%,transparent_55%,transparent_100%)]'
        : 'pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,rgba(15,61,46,0.52)_0%,rgba(15,61,46,0.12)_42%,transparent_72%)]'

  const innerClass =
    variant === 'banner'
      ? 'relative aspect-[21/9] min-h-[220px] w-full max-h-[min(52vh,560px)] sm:min-h-[260px]'
      : 'relative aspect-[4/5] w-full sm:aspect-[3/4] lg:aspect-[5/6]'

  const sizes =
    variant === 'banner'
      ? '(max-width: 1024px) 100vw, min(1280px, 100vw)'
      : '(max-width: 1024px) 100vw, 42vw'

  return (
    <div className={`relative overflow-hidden rounded-3xl bg-[#0F3D2E] ${border} ${className}`}>
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
