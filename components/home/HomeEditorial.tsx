'use client'

import Image from 'next/image'
import Link from 'next/link'

import { ConversionCtaBand } from '@/components/marketing/ConversionCtaBand'
import { HomeFeaturedGuestMoment } from '@/components/home/HomeFeaturedGuestMoment'
import { HomeRoyalCaribbeanDifference } from '@/components/home/HomeRoyalCaribbeanDifference'
import { HomeSignatureExperience } from '@/components/home/HomeSignatureExperience'
import { useHeroParallax, useHomeScrollReveal } from '@/components/home/useHomeMotion'
import { bornfidisPhotos } from '@/lib/bornfidis-photos'
import { PROVISIONS_HOME_STRIP } from '@/lib/homepage-content'
import { DIVISION_CARDS, ECOSYSTEM_HERO } from '@/lib/phase1-marketing'

/**
 * Bornfidis umbrella homepage.
 * Hero → two operating divisions → Provisions hospitality proof → pantry strip → CTA.
 */
export default function HomeEditorial() {
  useHomeScrollReveal()
  useHeroParallax()

  return (
    <div className="bf-home">
      <section className="hero">
        <div className="hero-left">
          <p className="label hero-enter hero-enter--1" style={{ marginBottom: '1.25rem' }}>
            Bornfidis
          </p>
          <h1 className="hero-title hero-enter hero-enter--1">
            {ECOSYSTEM_HERO.headlineLine1}
            <br />
            <span className="hero-accent ecosystem-hero-accent">{ECOSYSTEM_HERO.headlineLine2}</span>
          </h1>
          <div className="hero-rule hero-enter hero-enter--2" />
          <p className="hero-body hero-enter hero-enter--3">{ECOSYSTEM_HERO.body}</p>
          <div className="hero-actions hero-enter hero-enter--4 hero-actions--stack">
            <Link href={ECOSYSTEM_HERO.primaryCta.href} className="btn-primary">
              {ECOSYSTEM_HERO.primaryCta.label}
            </Link>
            <Link href={ECOSYSTEM_HERO.secondaryCta.href} className="btn-secondary-hero">
              {ECOSYSTEM_HERO.secondaryCta.label}
            </Link>
          </div>
        </div>
        <div className="hero-right hero-enter hero-enter--6">
          <div className="hero-photo-wrap">
            <Image
              src={bornfidisPhotos.table.vermontCabin}
              alt="A Bornfidis private dining table set inside a Vermont log cabin"
              fill
              priority
              className="hero-photo"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
          <div className="hero-overlay" aria-hidden />
          <div className="hero-caption">
            <p className="hero-caption-text">
              Practical systems for food,
              <br />
              hospitality, and enterprise.
            </p>
          </div>
        </div>
      </section>

      <section className="divisions reveal" aria-labelledby="divisions-title">
        <div className="divisions__inner">
          <p className="label">Operating divisions</p>
          <h2 id="divisions-title" className="divisions__headline">
            Two clear paths under one ecosystem
          </h2>
          <div className="divisions__grid">
            {DIVISION_CARDS.map((card) => (
              <article key={card.id} className="division-card">
                <p className="label">{card.eyebrow}</p>
                <h3 className="division-card__title">{card.title}</h3>
                <p className="division-card__body">{card.description}</p>
                <div className="division-card__actions">
                  <Link href={card.href} className="btn-primary division-card__cta">
                    {card.ctaLabel}
                  </Link>
                  <Link href={card.secondaryHref} className="division-card__link">
                    {card.secondaryCtaLabel} &rarr;
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <HomeSignatureExperience />
      <HomeRoyalCaribbeanDifference />
      <HomeFeaturedGuestMoment />

      <section className="provisions-strip reveal" aria-labelledby="provisions-strip-title">
        <div className="provisions-strip__inner">
          <div className="provisions-strip__copy">
            <p className="label">{PROVISIONS_HOME_STRIP.eyebrow}</p>
            <h2 id="provisions-strip-title" className="provisions-strip__headline">
              {PROVISIONS_HOME_STRIP.headline}
            </h2>
            <Link href={PROVISIONS_HOME_STRIP.href} className="provisions-strip__link">
              {PROVISIONS_HOME_STRIP.linkLabel} &rarr;
            </Link>
            <Link
              href={PROVISIONS_HOME_STRIP.requestHref}
              className="provisions-strip__link provisions-strip__link--secondary"
            >
              {PROVISIONS_HOME_STRIP.requestLabel} &rarr;
            </Link>
          </div>
          <Link href={PROVISIONS_HOME_STRIP.href} className="provisions-strip__photo-link">
            <Image
              src={PROVISIONS_HOME_STRIP.image}
              alt={PROVISIONS_HOME_STRIP.imageAlt}
              width={480}
              height={360}
              className="provisions-strip__photo"
            />
          </Link>
        </div>
      </section>

      <ConversionCtaBand
        variant="forest"
        eyebrow="Provisions — primary offer"
        title="Ready for the table?"
        body="Book private dining, request a product batch, or apply to the Digital Studio pilot."
        className="reveal"
      />
    </div>
  )
}
