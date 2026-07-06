'use client'

import {
  ROYAL_CARIBBEAN_HOME_CREDENTIALS,
  ROYAL_CARIBBEAN_HOME_STATS,
  ROYAL_CARIBBEAN_PROGRESSION,
} from '@/lib/homepage-content'

import { CountUpStat } from './CountUpStat'

export function HomeRoyalCaribbeanDifference() {
  return (
    <section className="rc-difference" aria-labelledby="rc-difference-title">
      <div className="rc-difference__inner">
        <header className="rc-difference__header reveal">
          <p className="label">The Royal Caribbean difference</p>
          <h2 id="rc-difference-title" className="rc-difference__title">
            Luxury-ship training. Your table.
          </h2>
          <p className="rc-difference__progression">{ROYAL_CARIBBEAN_PROGRESSION}</p>
        </header>

        <div className="rc-difference__stats reveal reveal-delay-1" role="list">
          {ROYAL_CARIBBEAN_HOME_STATS.map((stat) => (
            <div key={stat.label} className="rc-difference__stat" role="listitem">
              {stat.animateTo != null ? (
                <CountUpStat
                  displayValue={
                    stat.animateDecimals != null
                      ? stat.animateTo.toFixed(stat.animateDecimals)
                      : String(Math.round(stat.animateTo))
                  }
                  animateTo={stat.animateTo}
                  decimals={stat.animateDecimals ?? 0}
                  suffixSpan={stat.animateDecimals != null ? undefined : stat.valueSuffix}
                />
              ) : (
                <div className="rc-difference__stat-value">
                  {stat.value}
                  {stat.valueSuffix ? <span>{stat.valueSuffix}</span> : null}
                </div>
              )}
              <div className="rc-difference__stat-label">{stat.label}</div>
              {stat.detail ? <p className="rc-difference__stat-detail">{stat.detail}</p> : null}
            </div>
          ))}
        </div>

        <ul className="rc-difference__credentials reveal reveal-delay-2">
          {ROYAL_CARIBBEAN_HOME_CREDENTIALS.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </section>
  )
}
