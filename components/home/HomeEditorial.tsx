'use client'

import Image from 'next/image'
import Link from 'next/link'

import { HomeFeaturedGuestMoment } from '@/components/home/HomeFeaturedGuestMoment'
import { HomeRoyalCaribbeanDifference } from '@/components/home/HomeRoyalCaribbeanDifference'
import { HomeSignatureExperience } from '@/components/home/HomeSignatureExperience'
import { useHeroParallax, useHomeScrollReveal } from '@/components/home/useHomeMotion'
import {
  HOME_EXPERIENCE_JOURNEY,
  HOME_FINAL_CTA,
  HOME_GUEST_HERO,
  HOME_INCLUSIONS,
  PROVISIONS_HOME_STRIP,
} from '@/lib/homepage-content'

/**
 * Bornfidis homepage — private-dining guest front door (Fall–Winter 2026).
 * Non-dining divisions stay off the homepage conversion journey (nav/footer only).
 */
export default function HomeEditorial() {
  useHomeScrollReveal()
  useHeroParallax()

  return (
    <div className="bf-home">
      <section className="hero" aria-labelledby="home-hero-title">
        <div className="hero-left">
          <p className="label hero-enter hero-enter--1" style={{ marginBottom: '1.25rem' }}>
            {HOME_GUEST_HERO.eyebrow}
          </p>
          <h1 id="home-hero-title" className="hero-title hero-enter hero-enter--1">
            {HOME_GUEST_HERO.headline}
          </h1>
          <div className="hero-rule hero-enter hero-enter--2" />
          <p className="hero-body hero-enter hero-enter--3">{HOME_GUEST_HERO.body}</p>
          <p className="hero-trust hero-enter hero-enter--3">{HOME_GUEST_HERO.trustLine}</p>
          <div className="hero-actions hero-enter hero-enter--4 hero-actions--stack">
            <Link href={HOME_GUEST_HERO.primaryCta.href} className="btn-primary">
              {HOME_GUEST_HERO.primaryCta.label}
            </Link>
            <Link href={HOME_GUEST_HERO.secondaryCta.href} className="btn-secondary-hero">
              {HOME_GUEST_HERO.secondaryCta.label}
            </Link>
          </div>
        </div>
        <div className="hero-right hero-enter hero-enter--6">
          <div className="hero-photo-wrap">
            <Image
              src={HOME_GUEST_HERO.photoSrc}
              alt={HOME_GUEST_HERO.photoAlt}
              fill
              priority
              className="hero-photo"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
          <div className="hero-overlay" aria-hidden />
          <div className="hero-caption">
            <p className="hero-caption-text">{HOME_GUEST_HERO.caption}</p>
          </div>
        </div>
      </section>

      <section className="experience-journey reveal" aria-labelledby="experience-journey-title">
        <div className="experience-journey__inner">
          <p className="label">{HOME_EXPERIENCE_JOURNEY.eyebrow}</p>
          <h2 id="experience-journey-title" className="experience-journey__headline">
            {HOME_EXPERIENCE_JOURNEY.headline}
          </h2>
          <p className="experience-journey__lead">{HOME_EXPERIENCE_JOURNEY.lead}</p>
          <ol className="experience-journey__steps">
            {HOME_EXPERIENCE_JOURNEY.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </div>
      </section>

      <HomeSignatureExperience />

      <section className="home-inclusions reveal" aria-labelledby="home-inclusions-title">
        <div className="home-inclusions__inner">
          <p className="label">{HOME_INCLUSIONS.eyebrow}</p>
          <h2 id="home-inclusions-title" className="home-inclusions__headline">
            {HOME_INCLUSIONS.headline}
          </h2>
          <ul className="home-inclusions__list">
            {HOME_INCLUSIONS.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p className="home-inclusions__boundary">{HOME_INCLUSIONS.boundary}</p>
          <p className="home-inclusions__dietary">{HOME_INCLUSIONS.dietary}</p>
        </div>
      </section>

      <HomeRoyalCaribbeanDifference />
      <HomeFeaturedGuestMoment />

      <section className="provisions-strip reveal" aria-labelledby="provisions-strip-title">
        <div className="provisions-strip__inner">
          <div className="provisions-strip__copy">
            <p className="label">{PROVISIONS_HOME_STRIP.eyebrow}</p>
            <h2 id="provisions-strip-title" className="provisions-strip__headline">
              {PROVISIONS_HOME_STRIP.headline}
            </h2>
            <p className="provisions-strip__body">{PROVISIONS_HOME_STRIP.body}</p>
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

      <section className="home-final-cta reveal" aria-labelledby="home-final-cta-title">
        <div className="home-final-cta__inner">
          <p className="label home-final-cta__eyebrow">{HOME_FINAL_CTA.eyebrow}</p>
          <h2 id="home-final-cta-title" className="home-final-cta__title">
            {HOME_FINAL_CTA.title}
          </h2>
          <p className="home-final-cta__body">{HOME_FINAL_CTA.body}</p>
          <div className="home-final-cta__actions">
            <Link href={HOME_FINAL_CTA.primaryCta.href} className="home-final-cta__primary">
              {HOME_FINAL_CTA.primaryCta.label}
            </Link>
            <Link href={HOME_FINAL_CTA.secondaryCta.href} className="home-final-cta__secondary">
              {HOME_FINAL_CTA.secondaryCta.label}
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
