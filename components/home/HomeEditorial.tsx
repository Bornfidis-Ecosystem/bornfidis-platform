'use client'

import Image from 'next/image'
import Link from 'next/link'

import { ConversionCtaBand } from '@/components/marketing/ConversionCtaBand'
import { HomeFeaturedGuestMoment } from '@/components/home/HomeFeaturedGuestMoment'
import { HomeRoyalCaribbeanDifference } from '@/components/home/HomeRoyalCaribbeanDifference'
import { HomeSignatureExperience } from '@/components/home/HomeSignatureExperience'
import { useHeroParallax, useHomeScrollReveal } from '@/components/home/useHomeMotion'
import { bornfidisPhotos } from '@/lib/bornfidis-photos'
import { HERO, PROVISIONS_HOME_STRIP } from '@/lib/homepage-content'

/**
 * Bornfidis — editorial homepage (balanced structure).
 * Guest-first: hero → Chef's Passage → RC proof → guest moment → provisions strip → CTA.
 */
export default function HomeEditorial() {
  useHomeScrollReveal()
  useHeroParallax()

  return (
    <div className="bf-home">
      <section className="hero">
        <div className="hero-left">
          <h1 className="hero-title hero-enter hero-enter--1">
            {HERO.taglineLine1}
            <br />
            <span className="hero-accent">{HERO.taglineLine2}</span>
          </h1>
          <div className="hero-rule hero-enter hero-enter--2" />
          <p className="hero-body hero-enter hero-enter--3">{HERO.outcomeLine}</p>
          <p className="hero-jamaica-note hero-enter hero-enter--3">{HERO.jamaicaLine}</p>
          <div className="hero-actions hero-enter hero-enter--4">
            <Link href={HERO.primaryCta.href} className="btn-primary">
              {HERO.primaryCta.label}
            </Link>
          </div>
          <nav className="hero-secondary hero-enter hero-enter--5" aria-label="Secondary offers">
            {HERO.secondaryLinks.map((link, i) => (
              <span key={link.href} className="hero-secondary__item">
                {i > 0 ? <span className="hero-secondary__divider" aria-hidden>|</span> : null}
                <Link href={link.href} className="hero-secondary__link">
                  {link.label}
                </Link>
              </span>
            ))}
          </nav>
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
              Private dining in your home,
              <br />
              chalet, or Vermont retreat.
            </p>
            <div className="hero-score">
              <div className="hero-score-num">
                97<span>.80</span>
              </div>
              <div className="hero-score-label">Guest Score Average</div>
            </div>
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
        eyebrow="The table is ready"
        title="Your table is waiting. Let's begin."
        body="The Chef's Passage from $1,200 in Vermont. We come to you. We bring everything. You sit down."
        className="reveal"
      />
    </div>
  )
}
