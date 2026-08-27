import Image from 'next/image'
import Link from 'next/link'

import { HOME_SIGNATURE_EXPERIENCE } from '@/lib/homepage-content'

export function HomeSignatureExperience() {
  return (
    <section className="signature-experience" aria-labelledby="signature-experience-title">
      <div className="signature-experience__card reveal">
        <div className="signature-experience__inner">
          <div className="signature-experience__copy">
            <p className="label">{HOME_SIGNATURE_EXPERIENCE.eyebrow}</p>
            <h2 id="signature-experience-title" className="signature-experience__title">
              {HOME_SIGNATURE_EXPERIENCE.name}
            </h2>
            <p className="signature-experience__tagline">{HOME_SIGNATURE_EXPERIENCE.tagline}</p>
            <p className="signature-experience__authority">{HOME_SIGNATURE_EXPERIENCE.authority}</p>
            <p className="signature-experience__lead">{HOME_SIGNATURE_EXPERIENCE.description}</p>
            <p className="signature-experience__price">{HOME_SIGNATURE_EXPERIENCE.priceFraming}</p>
            <Link href={HOME_SIGNATURE_EXPERIENCE.ctaHref} className="signature-experience__cta">
              {HOME_SIGNATURE_EXPERIENCE.ctaLabel} &rarr;
            </Link>
          </div>
          <div className="signature-experience__side">
            <div className="signature-experience__media signature-experience__media--full">
              <Image
                src={HOME_SIGNATURE_EXPERIENCE.photoSrc}
                alt={HOME_SIGNATURE_EXPERIENCE.photoAlt}
                fill
                className="signature-experience__photo"
                sizes="(max-width: 1024px) 100vw, 40vw"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
