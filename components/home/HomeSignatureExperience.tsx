import Image from 'next/image'
import Link from 'next/link'

import { SIGNATURE_EXPERIENCE } from '@/lib/homepage-content'

export function HomeSignatureExperience() {
  return (
    <section className="signature-experience" aria-labelledby="signature-experience-title">
      <div className="signature-experience__card reveal">
        <div className="signature-experience__inner">
          <div className="signature-experience__copy">
            <p className="label">{SIGNATURE_EXPERIENCE.eyebrow}</p>
            <h2 id="signature-experience-title" className="signature-experience__title">
              {SIGNATURE_EXPERIENCE.name}
            </h2>
            <p className="signature-experience__tagline">{SIGNATURE_EXPERIENCE.tagline}</p>
            <p className="signature-experience__lead">{SIGNATURE_EXPERIENCE.description}</p>
            <p className="signature-experience__price">{SIGNATURE_EXPERIENCE.priceFraming}</p>
          <p className="signature-experience__jamaica">
            <Link href={SIGNATURE_EXPERIENCE.jamaicaContactHref} className="signature-experience__jamaica-link">
              {SIGNATURE_EXPERIENCE.jamaicaNote} &rarr;
            </Link>
          </p>
            <Link href={SIGNATURE_EXPERIENCE.ctaHref} className="signature-experience__cta">
              {SIGNATURE_EXPERIENCE.ctaLabel} &rarr;
            </Link>
          </div>
          <div className="signature-experience__side">
            <div className="signature-experience__media">
              <Image
                src={SIGNATURE_EXPERIENCE.photoSrc}
                alt={SIGNATURE_EXPERIENCE.photoAlt}
                fill
                className="signature-experience__photo"
                sizes="(max-width: 1024px) 100vw, 40vw"
              />
            </div>
            <div className="signature-experience__includes">
              <p className="label">What&apos;s included</p>
              <ul className="signature-experience__list">
                {SIGNATURE_EXPERIENCE.includes.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
