import type { Metadata } from 'next'
import Link from 'next/link'

import { BRAND_LEGAL } from '@/lib/brand-legal'

export const metadata: Metadata = {
  title: 'Privacy Policy — Bornfidis',
  description:
    'How Bornfidis Sportswear LLC and its assumed names collect and use information from forms, email, payments, and analytics.',
  alternates: { canonical: 'https://bornfidis.com/privacy' },
}

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[var(--color-bone)] px-6 py-16 text-[var(--color-slate)] md:px-12 md:py-24">
      <article className="mx-auto max-w-2xl">
        <p className="font-sans text-[0.6875rem] font-semibold uppercase tracking-[0.2em] text-[var(--color-gold)]">
          Legal
        </p>
        <h1 className="mt-3 font-display text-3xl font-semibold text-[var(--color-navy)] md:text-4xl">
          Privacy Policy
        </h1>
        <p className="mt-4 font-sans text-sm leading-relaxed text-[var(--color-muted)]">
          Last updated: July 13, 2026. This policy describes how {BRAND_LEGAL.legalEntity} (“we,” “us”)
          handles information when you use {BRAND_LEGAL.umbrellaName} websites and services, including{' '}
          {BRAND_LEGAL.provisionsDba} and {BRAND_LEGAL.digitalStudioDba} (assumed names of{' '}
          {BRAND_LEGAL.legalEntity}).
        </p>

        <section className="mt-10 space-y-4 font-sans text-sm leading-relaxed text-[var(--color-slate)]/90">
          <h2 className="font-display text-xl font-semibold text-[var(--color-navy)]">Information we collect</h2>
          <p>
            We collect information you submit through forms (for example name, email, phone, event details,
            business information, and messages), account authentication data when you sign in, and
            payment-related identifiers processed by our payment provider (Stripe). We may also collect basic
            technical data such as browser type and pages visited for site reliability.
          </p>
        </section>

        <section className="mt-8 space-y-4 font-sans text-sm leading-relaxed text-[var(--color-slate)]/90">
          <h2 className="font-display text-xl font-semibold text-[var(--color-navy)]">How we use information</h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>Respond to inquiries, bookings, product requests, and Digital Studio applications</li>
            <li>Provide quotes, deposits, balances, and related hospitality or project services</li>
            <li>Send transactional email (confirmations, quotes, payment notices)</li>
            <li>Operate authenticated dashboards and secure downloadable purchases where applicable</li>
            <li>Improve reliability and prevent spam or abuse</li>
          </ul>
        </section>

        <section className="mt-8 space-y-4 font-sans text-sm leading-relaxed text-[var(--color-slate)]/90">
          <h2 className="font-display text-xl font-semibold text-[var(--color-navy)]">Email</h2>
          <p>
            Transactional messages are sent through our email provider (Resend). Marketing or newsletter
            messages are only sent where you have opted in. You may contact{' '}
            <a className="text-[var(--color-navy)] underline" href={`mailto:${BRAND_LEGAL.email}`}>
              {BRAND_LEGAL.email}
            </a>{' '}
            to update preferences or request deletion of contact records subject to legal retention needs.
          </p>
        </section>

        <section className="mt-8 space-y-4 font-sans text-sm leading-relaxed text-[var(--color-slate)]/90">
          <h2 className="font-display text-xl font-semibold text-[var(--color-navy)]">Payments</h2>
          <p>
            Card payments are processed by Stripe. We do not store full payment card numbers on our servers.
            Stripe’s privacy practices apply to payment processing. Booking and order records may retain
            payment status, amounts, and Stripe identifiers needed for reconciliation and customer support.
          </p>
        </section>

        <section className="mt-8 space-y-4 font-sans text-sm leading-relaxed text-[var(--color-slate)]/90">
          <h2 className="font-display text-xl font-semibold text-[var(--color-navy)]">Analytics</h2>
          <p>
            We may use privacy-conscious analytics or event logging to understand product performance (for
            example whether a booking form was submitted). We do not intentionally send sensitive form field
            contents into advertising platforms. Additional analytics will only be enabled consistent with
            this policy and any consent requirements.
          </p>
        </section>

        <section className="mt-8 space-y-4 font-sans text-sm leading-relaxed text-[var(--color-slate)]/90">
          <h2 className="font-display text-xl font-semibold text-[var(--color-navy)]">Sharing</h2>
          <p>
            We share data with service providers necessary to operate the site (hosting, database, email,
            payments). We do not sell personal information. We may disclose information if required by law
            or to protect the rights and safety of our guests, clients, and {BRAND_LEGAL.legalEntity}.
          </p>
        </section>

        <section className="mt-8 space-y-4 font-sans text-sm leading-relaxed text-[var(--color-slate)]/90">
          <h2 className="font-display text-xl font-semibold text-[var(--color-navy)]">Contact</h2>
          <p>
            Privacy questions: {BRAND_LEGAL.email}. Entity: {BRAND_LEGAL.legalEntity}. Locations:{' '}
            {BRAND_LEGAL.locationsLine}.
          </p>
        </section>

        <p className="mt-12 font-sans text-sm">
          <Link href="/" className="font-semibold text-[var(--color-navy)] underline">
            Back to home
          </Link>
          {' · '}
          <Link href="/terms" className="font-semibold text-[var(--color-navy)] underline">
            Terms of use
          </Link>
        </p>
      </article>
    </main>
  )
}
