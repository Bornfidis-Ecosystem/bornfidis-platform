import type { ReactNode } from 'react'

export function InfoField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-muted">{label}</p>
      <div className="mt-0.5 text-sm text-forestDark">{children}</div>
    </div>
  )
}
