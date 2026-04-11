import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import './globals.css'
import RootShell from '@/components/layout/RootShell'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'Bornfidis',
  description:
    'A regenerative ecosystem delivering food, clothing, and education designed to restore people, land, and purpose.',
  icons: {
    icon: [{ url: '/brand/icons/icon-anchor-navy.png', type: 'image/png' }],
    apple: '/brand/icons/icon-anchor-navy.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="overflow-x-hidden">
      <body className={`${playfair.variable} ${inter.variable} font-sans overflow-x-hidden`}>
        <RootShell>{children}</RootShell>
      </body>
    </html>
  )
}
