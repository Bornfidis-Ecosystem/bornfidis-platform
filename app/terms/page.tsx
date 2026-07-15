import type { Metadata } from 'next'
import Link from 'next/link'

import { BRAND_LEGAL } from '@/lib/brand-legal'

export const metadata: Metadata = {
  title: 'Terms of Use — Bornfidis',
  description:
    'Terms governing use of Bornfidis websites and services operated by Bornfidis Sportswear LLC and its assumed names.',
  alternates: { canonical: 'https://bornfidis.com/terms' },
}

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[var(--color-bone)] px-6 py-16 text-[var(--color-slate)] md:px-12 md:py-24">
      <article className="mx-auto max-w-2xl">
        <p className="font-sans text-[0.6875rem] font-semibold uppercase tracking-[0.2em] text-[var(--color-gold)]">
          Legal
        </p>
        <h1 className="mt-3 font-display text-3xl font-semibold text-[var(--color-navy)] md:text-4xl">
          Terms of Use
        </h1>
        <p className="mt-4 font-sans text-sm leading-relaxed text-[var(--color-muted)]">
          Last updated: July 13, 2026. These terms govern access to and use of {BRAND_LEGAL.umbrellaName}{' '}
          websites and related services offered by {BRAND_LEGAL.legalEntity}, including services branded as{' '}
          {BRAND_LEGAL.provisionsDba} and {BRAND_LEGAL.digitalStudioDba} (assumed names of{' '}
          {BRAND_LEGAL.legalEntity}).
        </p>

        <section className="mt-10 space-y-4 font-sans text-sm leading-relaxed text-[var(--color-slate)]/90">
          <h2 className="font-display text-xl font-semibold text-[var(--color-navy)]">Agreement</h2>
          <p>
            By using this website or submitting an inquiry, application, or payment, you agree to these
            terms and our{' '}
            <Link href="/privacy" className="text-[var(--color-navy)] underline">
              Privacy Policy
            </Link>
            . If you do not agree, do not use the site.
          </p>
        </section>

        <section className="mt-8 space-y-4 font-sans text-sm leading-relaxed text-[var(--color-slate)]/90">
          <h2 className="font-display text-xl font-semibold text-[var(--color-navy)]">Services</h2>
          <p>
            <strong>{BRAND_LEGAL.provisionsDba}</strong> offers chef-led hospitality, private dining
            inquiries, and product requests. Availability, menus, and pricing are confirmed in writing
            (quote or confirmation) for each engagement.
          </p>
          <p>
            <strong>{BRAND_LEGAL.digitalStudioDba}</strong> offers digital systems work on an application /
            pilot basis. Public pages do not constitute a standing offer of fixed pricing. Scope and fees
            are agreed in writing before work begins.
          </p>
        </section>

        <section className="mt-8 space-y-4 font-sans text-sm leading-relaxed text-[var(--color-slate)]/90">
          <h2 className="font-display text-xl font-semibold text-[var(--color-navy)]">Quotes and payments</h2>
          <p>
            Quotes may expire. Deposits and balances are processed through Stripe. Payment of a deposit may
            confirm a booking or project start subject to the written confirmation we send. Refunds, if any,
            are governed by the confirmation or agreement for that engagement.
          </p>
        </section>

        <section className="mt-8 space-y-4 font-sans text-sm leading-relaxed text-[var(--color-slate)]/90">
          <h2 className="font-display text-xl font-semibold text-[var(--color-navy)]">Conduct and accuracy</h2>
          <p>
            You agree to provide accurate contact and event information and not to misuse forms, accounts,
            or payment tools. We may refuse or cancel requests that appear fraudulent, abusive, or
            unworkable.
          </p>
        </section>

        <section className="mt-8 space-y-4 font-sans text-sm leading-relaxed text-[var(--color-slate)]/90">
          <h2 className="font-display text-xl font-semibold text-[var(--color-navy)]">Intellectual property</h2>
          <p>
            Site content, branding, photography, and downloads remain the property of{' '}
            {BRAND_LEGAL.legalEntity} or its licensors unless otherwise stated. Purchased digital materials
            are licensed for your personal or internal business use as described at purchase.
          </p>
        </section>

        <section className="mt-8 space-y-4 font-sans text-sm leading-relaxed text-[var(--color-slate)]/90">
          <h2 className="font-display text-xl font-semibold text-[var(--color-navy)]">Disclaimer</h2>
          <p>
            The site is provided as-is. We do not warrant uninterrupted access. To the fullest extent
            permitted by law, {BRAND_LEGAL.legalEntity} is not liable for indirect or consequential damages
            arising from use of the site. Liability for paid services is limited as set out in the written
            agreement for that service.
          </p>
        </section>

        <section className="mt-8 space-y-4 font-sans text-sm leading-relaxed text-[var(--color-slate)]/90">
          <h2 className="font-display text-xl font-semibold text-[var(--color-navy)]">Governing law</h2>
          <p>
            These terms are governed by the laws of the State of Vermont, USA, without regard to conflict of
            law rules, except where mandatory local law applies.
          </p>
        </section>

        <section className="mt-8 space-y-4 font-sans text-sm leading-relaxed text-[var(--color-slate)]/90">
          <h2 className="font-display text-xl font-semibold text-[var(--color-navy)]">Contact</h2>
          <p>
            {BRAND_LEGAL.email} · {BRAND_LEGAL.legalEntity} · {BRAND_LEGAL.locationsLine}
          </p>
        </section>

        <p className="mt-12 font-sans text-sm">
          <Link href="/" className="font-semibold text-[var(--color-navy)] underline">
            Back to home
          </Link>
          {' · '}
          <Link href="/privacy" className="font-semibold text-[var(--color-navy)] underline">
            Privacy policy
          </Link>
        </p>
      </article>
    </main>
  )
}
