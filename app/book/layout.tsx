import type { ReactNode } from 'react'
import { Bebas_Neue, DM_Sans, Playfair_Display } from 'next/font/google'

const bebas = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-home-bebas',
})

const dmSans = DM_Sans({
  weight: ['300', '400', '500', '600'],
  subsets: ['latin'],
  variable: '--font-home-dm',
})

const playfairAccent = Playfair_Display({
  subsets: ['latin'],
  style: ['italic', 'normal'],
  variable: '--font-home-playfair',
})

export default function BookLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className={`${bebas.variable} ${dmSans.variable} ${playfairAccent.variable} home-brutalist-root relative`}
    >
      <div
        className="home-brutalist-grain pointer-events-none fixed inset-0 z-[2]"
        aria-hidden
      />
      {children}
    </div>
  )
}
