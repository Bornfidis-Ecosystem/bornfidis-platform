import type { ReactNode } from 'react'

/** /book uses root layout fonts (Poppins + Montserrat) — editorial booking surface. */
export default function BookLayout({ children }: { children: ReactNode }) {
  return <div className="book-culinary-root min-h-screen bg-bone text-charcoal">{children}</div>
}
