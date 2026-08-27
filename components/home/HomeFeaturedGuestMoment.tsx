import Image from 'next/image'

import { FEATURED_GUEST_MOMENT } from '@/lib/homepage-content'

export function HomeFeaturedGuestMoment() {
  const { eyebrow, headline, body, momentLabel, imageSrc, imageAlt } = FEATURED_GUEST_MOMENT

  return (
    <section className="featured-guest" aria-labelledby="featured-guest-title">
      <div className="featured-guest__inner">
        <div className="featured-guest__media reveal">
          <div className="featured-guest__image-wrap">
            <Image src={imageSrc} alt={imageAlt} fill className="featured-guest__image" sizes="(max-width: 900px) 100vw, 50vw" />
          </div>
          <p className="featured-guest__moment-label">{momentLabel}</p>
        </div>
        <div className="featured-guest__copy reveal reveal-delay-1">
          <p className="label">{eyebrow}</p>
          <h2 id="featured-guest-title" className="featured-guest__title">
            {headline}
          </h2>
          <p className="featured-guest__body">{body}</p>
        </div>
      </div>
    </section>
  )
}
