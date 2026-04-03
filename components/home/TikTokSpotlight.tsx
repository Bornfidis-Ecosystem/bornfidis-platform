'use client'

import Script from 'next/script'
import { useId } from 'react'

function tiktokProfileUrl(handle: string): string {
  const h = handle.replace(/^@/, '').trim()
  return `https://www.tiktok.com/@${h}`
}

/**
 * Embeds TikTok videos when `NEXT_PUBLIC_TIKTOK_VIDEO_IDS` is set (comma-separated numeric IDs).
 * Always shows a profile CTA. Requires TikTok&apos;s embed script for blockquotes to hydrate.
 */
export default function TikTokSpotlight() {
  const uid = useId()
  const handle = (process.env.NEXT_PUBLIC_TIKTOK_HANDLE || '').trim()
  const rawIds = (process.env.NEXT_PUBLIC_TIKTOK_VIDEO_IDS || '')
    .split(/[,\s]+/)
    .map((s) => s.trim())
    .filter(Boolean)

  if (!handle) {
    return null
  }

  const profile = tiktokProfileUrl(handle)
  const cite = (id: string) => `${profile}/video/${id}`

  return (
    <section className="border-t border-[#E8E1D2] bg-[#F7F3EA]">
      <div className="mx-auto max-w-7xl px-6 py-16 md:px-10">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#9D7C2F]">On TikTok</p>
          <h2 className="mt-4 text-3xl font-semibold text-[#0F3D2E] md:text-4xl">
            Behind the pass — quick moments from the kitchen &amp; events
          </h2>
          <p className="mt-4 text-lg leading-8 text-[#25483C]">
            Prep reels, plated courses, and the rhythm of live service — short-form, straight from the
            kitchen.
          </p>
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-4">
          <a
            href={profile}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-full bg-[#0F3D2E] px-6 py-3 font-medium text-white transition hover:opacity-95"
          >
            Follow @{handle.replace(/^@/, '')} on TikTok
          </a>
        </div>

        {rawIds.length > 0 ? (
          <div className="mt-10 grid gap-8 lg:grid-cols-3">
            {rawIds.map((id) => (
              <div key={`${uid}-${id}`} className="min-w-0 flex justify-center">
                <blockquote
                  className="tiktok-embed mx-auto w-full min-w-[280px] max-w-[605px]"
                  cite={cite(id)}
                  data-video-id={id}
                >
                  <section>
                    <a
                      target="_blank"
                      rel="noopener noreferrer"
                      title={`@${handle}`}
                      href={profile}
                    >
                      @{handle.replace(/^@/, '')}
                    </a>
                  </section>
                </blockquote>
              </div>
            ))}
          </div>
        ) : null}

        <Script async src="https://www.tiktok.com/embed.js" strategy="lazyOnload" />
      </div>
    </section>
  )
}
