import Link from 'next/link'

import { JOURNAL_HOME_TEASER } from '@/lib/homepage-content'

export function HomeJournalTeaser() {
  return (
    <section className="journal-teaser" aria-labelledby="journal-teaser-title">
      <div className="journal-teaser__inner reveal">
        <p className="label">{JOURNAL_HOME_TEASER.eyebrow}</p>
        <h2 id="journal-teaser-title" className="journal-teaser__headline">
          {JOURNAL_HOME_TEASER.headline}
        </h2>
        <Link href={JOURNAL_HOME_TEASER.href} className="journal-teaser__link">
          {JOURNAL_HOME_TEASER.linkLabel} &rarr;
        </Link>
      </div>
    </section>
  )
}
