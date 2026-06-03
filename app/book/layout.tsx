import type { ReactNode } from 'react'

/** /book uses root layout fonts (Libre Caslon + Montserrat) — Culinary OS editorial surface. */
export default function BookLayout({ children }: { children: ReactNode }) {
  return <div className="book-culinary-root min-h-screen bg-[#fdf8f8] text-[#2c2c2c]">{children}</div>
}
