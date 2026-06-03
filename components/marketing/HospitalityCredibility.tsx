import {
  FOUNDER_TABLE_QUOTE,
  HOSPITALITY_MILESTONES,
  HOSPITALITY_SHIPS,
  HOSPITALITY_STATS,
  HOSPITALITY_TESTIMONIALS,
  RC_APPRAISAL_QUOTE,
} from '@/lib/hospitality-credibility'

import './hospitality-credibility.css'

type HospitalityCredibilityProps = {
  /** Slightly shorter lead on private dining page */
  context?: 'home' | 'private-dining'
  className?: string
}

/**
 * Dedicated trust & authority block — stats, milestones, testimonials, RC record.
 */
export function HospitalityCredibility({
  context = 'home',
  className = '',
}: HospitalityCredibilityProps) {
  const lead =
    context === 'private-dining'
      ? 'Before you book, know who is coming to your table — thirteen years inside the world’s largest luxury vessels, documented guest scores, and private dining built for hosts who expect more than a meal.'
      : 'Bornfidis is led by Brian Maylor — Culinary Director, private chef, and a thirteen-year Royal Caribbean veteran who learned the galley and the dining room before building a table of his own.'

  return (
    <section
      className={`bf-hospitality-cred ${className}`.trim()}
      aria-labelledby="hospitality-cred-title"
    >
      <div className="bf-hospitality-cred__inner">
        <header className="bf-hospitality-cred__header">
          <p className="bf-hospitality-cred__eyebrow">Trust &amp; authority</p>
          <h2 id="hospitality-cred-title" className="bf-hospitality-cred__title">
            Operated by an experienced <em>hospitality professional.</em>
          </h2>
          <p className="bf-hospitality-cred__lead">{lead}</p>
        </header>

        <div className="bf-hospitality-cred__stats" role="list">
          {HOSPITALITY_STATS.map((stat) => (
            <div key={stat.label} className="bf-hospitality-cred__stat" role="listitem">
              <div className="bf-hospitality-cred__stat-value">
                {stat.value}
                {stat.valueSuffix ? <span>{stat.valueSuffix}</span> : null}
              </div>
              <div className="bf-hospitality-cred__stat-label">{stat.label}</div>
              <p className="bf-hospitality-cred__stat-detail">{stat.detail}</p>
            </div>
          ))}
        </div>

        <p className="bf-hospitality-cred__milestones-label">Hospitality milestones</p>
        <div className="bf-hospitality-cred__milestones">
          {HOSPITALITY_MILESTONES.map((m) => (
            <div key={m.year + m.title} className="bf-hospitality-cred__milestone">
              <div className="bf-hospitality-cred__milestone-year">{m.year}</div>
              <div className="bf-hospitality-cred__milestone-title">{m.title}</div>
              <p className="bf-hospitality-cred__milestone-note">{m.note}</p>
            </div>
          ))}
        </div>

        <div className="bf-hospitality-cred__testimonials-head">
          <h3 className="bf-hospitality-cred__testimonials-title">Client feedback &amp; record</h3>
          <p className="bf-hospitality-cred__testimonials-note">
            Shared with permission · Verified employment &amp; guest testimonials
          </p>
        </div>

        <div className="bf-hospitality-cred__quotes">
          {HOSPITALITY_TESTIMONIALS.map((t) => (
            <blockquote key={t.name} className="bf-hospitality-cred__quote-card">
              <div className="bf-hospitality-cred__quote-mark" aria-hidden>
                &ldquo;
              </div>
              <p className="bf-hospitality-cred__quote-text">{t.quote}</p>
              <footer className="bf-hospitality-cred__quote-footer">
                <cite className="bf-hospitality-cred__quote-name not-italic">{t.name}</cite>
                <p className="bf-hospitality-cred__quote-context">{t.detail}</p>
              </footer>
            </blockquote>
          ))}
          <blockquote className="bf-hospitality-cred__quote-card bf-hospitality-cred__quote-card--record">
            <div className="bf-hospitality-cred__quote-mark" aria-hidden>
              &ldquo;
            </div>
            <p className="bf-hospitality-cred__quote-text">{RC_APPRAISAL_QUOTE.quote}</p>
            <footer className="bf-hospitality-cred__quote-footer">
              <cite className="bf-hospitality-cred__quote-name not-italic">
                {RC_APPRAISAL_QUOTE.attribution}
              </cite>
              <p className="bf-hospitality-cred__quote-context">{RC_APPRAISAL_QUOTE.context}</p>
            </footer>
          </blockquote>
        </div>

        <div className="bf-hospitality-cred__ships">
          <span className="bf-hospitality-cred__ships-label">Ships served</span>
          {HOSPITALITY_SHIPS.map((ship, i) => (
            <span key={ship} style={{ display: 'contents' }}>
              <span className="bf-hospitality-cred__ship">{ship}</span>
              {i < HOSPITALITY_SHIPS.length - 1 ? (
                <span className="bf-hospitality-cred__ship-divider" aria-hidden>
                  ·
                </span>
              ) : null}
            </span>
          ))}
        </div>

        {context === 'private-dining' ? (
          <blockquote className="bf-hospitality-cred__founder-quote">
            <p className="bf-hospitality-cred__quote-text">{FOUNDER_TABLE_QUOTE.quote}</p>
            <footer className="bf-hospitality-cred__quote-footer">
              <cite className="bf-hospitality-cred__quote-name not-italic">
                {FOUNDER_TABLE_QUOTE.attribution}
              </cite>
              <p className="bf-hospitality-cred__quote-context">{FOUNDER_TABLE_QUOTE.context}</p>
            </footer>
          </blockquote>
        ) : null}
      </div>
    </section>
  )
}
