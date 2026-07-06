'use client'

import { useEffect, useRef, useState } from 'react'

function easeOutCubic(t: number) {
  return 1 - (1 - t) ** 3
}

type CountUpStatProps = {
  /** Static fallback for SSR and reduced motion */
  displayValue: string
  animateTo: number
  decimals?: number
  durationMs?: number
  suffixSpan?: string
  className?: string
}

/**
 * Count-up for Royal Caribbean stat block — runs once when the stat enters view.
 */
export function CountUpStat({
  displayValue,
  animateTo,
  decimals = 0,
  durationMs = 1100,
  suffixSpan,
  className = '',
}: CountUpStatProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const [value, setValue] = useState(displayValue)
  const hasRun = useRef(false)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting || hasRun.current) return
        hasRun.current = true
        observer.disconnect()

        const start = performance.now()
        const tick = (now: number) => {
          const progress = Math.min((now - start) / durationMs, 1)
          const current = easeOutCubic(progress) * animateTo
          setValue(current.toFixed(decimals))
          if (progress < 1) requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
      },
      { threshold: 0.4, rootMargin: '0px 0px -10% 0px' }
    )

    observer.observe(root)
    return () => observer.disconnect()
  }, [animateTo, decimals, durationMs])

  return (
    <div ref={rootRef} className={`rc-difference__stat-value ${className}`.trim()}>
      {value}
      {suffixSpan ? <span>{suffixSpan}</span> : null}
    </div>
  )
}
