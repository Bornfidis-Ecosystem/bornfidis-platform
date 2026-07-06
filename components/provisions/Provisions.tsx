'use client'

import Image from 'next/image'
import Link from 'next/link'

import { ConversionCtaBand } from '@/components/marketing/ConversionCtaBand'
import { BRAND_LEGAL } from '@/lib/brand-legal'
import { PHASE1_CTA } from '@/lib/phase1-marketing'
import {
  PROVISIONS_FLAGSHIP_PRODUCTS,
  PROVISIONS_GIFT_BUNDLE,
  PROVISIONS_HEADER_IMAGE,
  PROVISIONS_HERO,
  type ProvisionsProduct,
} from '@/lib/provisions-products'

function ProductCard({ product }: { product: ProvisionsProduct }) {
  const requestHref = `${PHASE1_CTA.requestProduct.href}&product=${product.id}`

  return (
    <article id={product.id} className="bf-prov-product">
      <div className="bf-prov-product__media">
        <Image
          src={product.imageHero}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="bf-prov-product__img bf-prov-product__img--hero"
        />
        {product.imageHover ? (
          <Image
            src={product.imageHover}
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="bf-prov-product__img bf-prov-product__img--hover"
            aria-hidden
          />
        ) : null}
        <span className="bf-prov-product__status">{product.status}</span>
      </div>

      <div className="bf-prov-product__body">
        <p className="label">{product.categoryLabel}</p>
        <h2 className="bf-prov-product__name">{product.name}</h2>
        <p className="bf-prov-product__tagline">{product.tagline}</p>
        <p className="bf-prov-product__desc">{product.description}</p>
        <div className="bf-prov-product__meta">
          <span>{product.size}</span>
          <span className="bf-prov-product__price">{product.priceFrom}</span>
        </div>
        <Link href={requestHref} className="bf-prov-product__cta">
          Request this batch
        </Link>
      </div>
    </article>
  )
}

/**
 * Provisions — header lineup photo, product grid with hover swaps, guest package.
 */
export default function Provisions() {
  const giftRequestHref = `${PHASE1_CTA.requestProduct.href}&product=${PROVISIONS_GIFT_BUNDLE.id}`

  return (
    <div className="bf-prov">
      <header className="bf-prov-hero">
        <div className="bf-prov-hero__bg" aria-hidden>
          <Image
            src={PROVISIONS_HEADER_IMAGE}
            alt=""
            fill
            priority
            className="bf-prov-hero__bg-img"
            sizes="100vw"
          />
        </div>
        <div className="bf-prov-hero__inner">
          <p className="label">Bornfidis Provisions</p>
          <h1 className="bf-prov-hero__title">
            {PROVISIONS_HERO.titleLine1}
            <br />
            <span>{PROVISIONS_HERO.titleLine2}</span>
          </h1>
          <p className="bf-prov-hero__body">{PROVISIONS_HERO.body}</p>
          <p className="bf-prov-hero__process">{PROVISIONS_HERO.processLine}</p>
          <Link href={PHASE1_CTA.requestProduct.href} className="bf-prov-hero__cta">
            {PHASE1_CTA.requestProduct.label}
          </Link>
        </div>
      </header>

      <section className="bf-prov-catalog" aria-labelledby="prov-catalog-title">
        <div className="bf-prov-catalog__head">
          <p className="label">Current test batches</p>
          <h2 id="prov-catalog-title" className="bf-prov-catalog__title">
            Four provisions from our kitchen — photos from real customer test runs.
          </h2>
          <p className="bf-prov-catalog__note">
            Hand-made in limited runs across {BRAND_LEGAL.locationsLine}. No warehouse shelves — we
            batch when you request.
          </p>
        </div>

        <div className="bf-prov-catalog__grid">
          {PROVISIONS_FLAGSHIP_PRODUCTS.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="bf-prov-gift" aria-labelledby="prov-gift-title">
        <div className="bf-prov-gift__media">
          <Image
            src={PROVISIONS_GIFT_BUNDLE.image}
            alt="Bornfidis Guest Welcome Package — four provisions in a wicker basket"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="bf-prov-gift__img"
          />
        </div>
        <div className="bf-prov-gift__body">
          <p className="label">Curated set</p>
          <h2 id="prov-gift-title" className="bf-prov-gift__title">
            {PROVISIONS_GIFT_BUNDLE.title}
          </h2>
          <p className="bf-prov-gift__desc">{PROVISIONS_GIFT_BUNDLE.body}</p>
          <p className="bf-prov-gift__price">{PROVISIONS_GIFT_BUNDLE.priceFrom}</p>
          <Link href={giftRequestHref} className="bf-prov-gift__cta">
            Request the welcome package
          </Link>
        </div>
      </section>

      <section className="bf-prov-process" aria-label="How ordering works">
        <ol className="bf-prov-process__steps">
          <li>
            <span className="bf-prov-process__num">1</span>
            <strong>Request</strong>
            <p>Tell us what you want and how many.</p>
          </li>
          <li>
            <span className="bf-prov-process__num">2</span>
            <strong>Produce</strong>
            <p>We batch when demand aligns — never inventory-first.</p>
          </li>
          <li>
            <span className="bf-prov-process__num">3</span>
            <strong>Deliver</strong>
            <p>Shipped or hand-delivered when your run is ready.</p>
          </li>
        </ol>
      </section>

      <ConversionCtaBand
        variant="forest"
        compact
        eyebrow="Pantry & table"
        title="Need a batch for your table?"
        body="Request any provision or the full Guest Welcome Package. We respond within 24 hours."
      />
    </div>
  )
}
