import type { ReactNode } from 'react'

export function ThanksMessage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="text-center">
      <h2 className="font-display text-xl font-semibold tracking-tight text-midnight md:text-2xl">{title}</h2>
      <div className="mt-4 text-base leading-relaxed text-forestDark/90">{children}</div>
    </div>
  )
}
