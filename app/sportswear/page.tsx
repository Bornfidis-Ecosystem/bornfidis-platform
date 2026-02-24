import Link from 'next/link'
import { SportswearGrid } from './SportswearGrid'

export const metadata = {
  title: 'Sportswear | Bornfidis Provisions',
  description:
    'Performance wear built for farmers, chefs & regenerative workers. Zero inventory, print-on-demand. Launching Q3 2026.',
}

export default function SportswearPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero */}
      <section className="w-full bg-navy text-white">
        <div className="max-w-4xl mx-auto px-6 py-16 md:py-20 text-center">
          <div className="h-1 w-16 bg-gold rounded-full mx-auto mb-6" aria-hidden />
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
            Bornfidis Sportswear
          </h1>
          <p className="text-xl text-green-100 max-w-xl mx-auto mb-2">
            Performance Wear Built for Farmers, Chefs & Regenerative Workers
          </p>
          <p className="text-gold font-semibold">
            Launching Q3 2026 — Pre-order now and save 20%
          </p>
        </div>
      </section>

      {/* Product grid */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <SportswearGrid />
      </section>

      {/* Print-on-demand blurb */}
      <section className="max-w-3xl mx-auto px-6 py-12 text-center border-t border-gray-200">
        <h2 className="text-xl font-semibold text-navy mb-4">Why Print-on-Demand?</h2>
        <ul className="space-y-2 text-gray-700 text-sm md:text-base">
          <li><strong>Zero inventory waste</strong> — Items are made when you order</li>
          <li><strong>Printed and shipped on demand</strong> — High-quality, ethically made</li>
          <li><strong>Built for the field and kitchen</strong> — Durable, comfortable, branded</li>
        </ul>
      </section>

      <div className="max-w-xl mx-auto px-6 pb-16 text-center">
        <Link
          href="/academy"
          className="text-forest font-medium hover:underline"
        >
          ← Back to Academy
        </Link>
      </div>
    </main>
  )
}
