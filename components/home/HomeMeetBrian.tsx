import Image from 'next/image'
import Link from 'next/link'

import { MEET_BRIAN_HOME } from '@/lib/homepage-content'

export function HomeMeetBrian() {
  return (
    <section className="meet-brian" aria-labelledby="meet-brian-title">
      <div className="meet-brian__inner">
        <div className="meet-brian__portrait reveal">
          <div className="meet-brian__image-wrap">
            <Image
              src={MEET_BRIAN_HOME.portraitSrc}
              alt={MEET_BRIAN_HOME.portraitAlt}
              fill
              className="meet-brian__image"
              sizes="(max-width: 900px) 80vw, 320px"
            />
          </div>
        </div>
        <div className="meet-brian__copy reveal reveal-delay-1">
          <p className="label">{MEET_BRIAN_HOME.eyebrow}</p>
          <h2 id="meet-brian-title" className="meet-brian__headline">
            {MEET_BRIAN_HOME.headline}
          </h2>
          <p className="meet-brian__body">{MEET_BRIAN_HOME.body}</p>
          <Link href={MEET_BRIAN_HOME.storyHref} className="meet-brian__link">
            {MEET_BRIAN_HOME.storyLabel} &rarr;
          </Link>
        </div>
      </div>
    </section>
  )
}
