'use client'

import { useEffect } from 'react'

/** One-time scroll reveals for `.bf-home .reveal` — respects prefers-reduced-motion. */
export function useHomeScrollReveal() {
  useEffect(() => {
    const root = document.querySelector('.bf-home')
    if (!root) return

    const reveals = root.querySelectorAll<HTMLElement>('.reveal')
    if (reveals.length === 0) return

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) {
      reveals.forEach((el) => el.classList.add('visible'))
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -32px 0px' }
    )

    reveals.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])
}

/** Subtle hero image parallax — disabled when reduced motion is preferred. */
export function useHeroParallax() {
  useEffect(() => {
    const media = document.querySelector<HTMLElement>('.bf-home .hero-photo-wrap')
    if (!media) return

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) return

    let raf = 0
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const y = Math.min(window.scrollY, window.innerHeight)
        media.style.transform = `translate3d(0, ${y * 0.08}px, 0) scale(1.04)`
      })
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
    }
  }, [])
}
