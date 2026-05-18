import type { Metadata } from 'next'
import { Inter, Libre_Caslon_Text, Montserrat } from 'next/font/google'
import './globals.css'
import RootShell from '@/components/layout/RootShell'
import { brandAssets } from '@/lib/brand-assets'

/** Headlines — WordPress brief: Libre Caslon Text (wired to legacy --font-playfair for Tailwind). */
const headline = Libre_Caslon_Text({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-playfair',
})

/** UI / body — WordPress brief: Montserrat (wired to legacy --font-inter for Tailwind). */
const ui = Montserrat({
  subsets: ['latin'],
  variable: '--font-inter',
})

/** Culinary OS / admin operational UI — DESIGN.md (Inter). */
const culinaryUi = Inter({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-culinary-ui',
})

export const metadata: Metadata = {
  title: 'Bornfidis',
  description:
    'Bornfidis Provisions — Private chef experiences in Vermont and Jamaica. Caribbean fine dining, live-fire cooking, and intimate hospitality crafted by Chef Brian Maylor.',
  icons: {
    icon: [{ url: brandAssets.iconGold, type: 'image/png' }],
    apple: brandAssets.iconGold,
  },
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="overflow-x-hidden">
      <body
        className={`${headline.variable} ${ui.variable} ${culinaryUi.variable} font-sans overflow-x-hidden`}
      >
        <RootShell>{children}</RootShell>
      </body>
    </html>
  )
}
