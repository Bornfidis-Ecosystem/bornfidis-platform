import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import PublicNav from '@/components/layout/PublicNav'
import PublicFooter from '@/components/layout/PublicFooter'
import { ToastContainer } from '@/components/ui/Toast'
import { SyncButton } from '@/components/ui/SyncButton'
import { OfflineSyncProvider } from '@/components/ui/OfflineSyncProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Bornfidis Provisions | Regenerating Land, People & Enterprise',
  description: 'Faith-anchored food and fellowship regenerating communities through regenerative agriculture, fair trade, and generational wealth building.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="overflow-x-hidden">
      <body className={`${inter.className} overflow-x-hidden`}>
        <div className="min-h-screen flex flex-col">
          <OfflineSyncProvider>
            <PublicNav />
            <main className="flex-1 w-full">{children}</main>
            <PublicFooter />
            <ToastContainer />
            <SyncButton />
          </OfflineSyncProvider>
        </div>
      </body>
    </html>
  )
}
