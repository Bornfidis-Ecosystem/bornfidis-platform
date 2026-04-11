import Link from 'next/link'
import { DesignAgentClient } from '@/components/admin/DesignAgentClient'

export const dynamic = 'force-dynamic'

export default function DesignAgentPage() {
  return (
    <div className="min-h-screen bg-stone-50">
      <div className="border-b border-stone-200 bg-white/95 backdrop-blur-sm px-4 py-4 md:px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-baseline gap-2">
            <Link
              href="/admin"
              className="text-[#1A3C34] font-semibold tracking-[0.2em] uppercase text-sm"
            >
              Bornfidis
            </Link>
            <span className="text-stone-300 font-light">/</span>
            <span className="text-stone-600 font-medium">Design Agent</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-10">
        <header className="mb-10 text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-[#1A3C34] mb-2">
            AI Design Prompt Generator
          </h1>
          <p className="text-stone-600 max-w-xl mx-auto">
            Build brand-correct prompts for product labels, clothing graphics, book covers, and marketing assets. 
            Colors, typography, and division style are applied automatically.
          </p>
        </header>

        <DesignAgentClient />
      </div>
    </div>
  )
}
