'use client'

import type { ReactNode } from 'react'
import { Toaster } from 'react-hot-toast'
import PublicNav from '@/components/layout/PublicNav'
import ConditionalPublicFooter from '@/components/layout/ConditionalPublicFooter'
import { ToastContainer } from '@/components/ui/Toast'
import { SyncButton } from '@/components/ui/SyncButton'
import { OfflineSyncProvider } from '@/components/ui/OfflineSyncProvider'

export default function RootShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <OfflineSyncProvider>
        <PublicNav />
        <main className="w-full flex-1">{children}</main>
        <ConditionalPublicFooter />
        <ToastContainer />
        <Toaster position="top-center" toastOptions={{ duration: 4000 }} />
        <SyncButton />
      </OfflineSyncProvider>
    </div>
  )
}
