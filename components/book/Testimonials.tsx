import Image from 'next/image'

import { FEATURED_GUEST_TESTIMONIALS } from '@/lib/guest-testimonials'
import { testimonialCardImages } from '@/lib/book-marketing-images'

const TESTIMONIALS = FEATURED_GUEST_TESTIMONIALS.map((t) => ({
  ...t,
  event: t.detail,
}))

/** Dark / gold cards with photography — book page social proof */
export function Testimonials() {
  const gridClass =
    TESTIMONIALS.length === 1
      ? 'mx-auto grid max-w-lg grid-cols-1 gap-8'
      : 'grid grid-cols-1 gap-8 md:grid-cols-2'

  return (
    <section className="bg-[#050505] px-6 py-24 text-white md:px-16">
      <div className="mx-auto max-w-6xl">
        <div className="mb-16">
          <p className="mb-4 text-xs uppercase tracking-[0.2em] text-[#C9A84C]">Past Experiences</p>
          <h2 className="font-display text-4xl font-black uppercase leading-none md:text-5xl">
            What Clients Say
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/45">
            A glimpse of the craft behind the reviews — plating, hospitality, and small-batch
            provisions.
          </p>
        </div>

        <div className={gridClass}>
          {TESTIMONIALS.map((t, i) => (
            <article
              key={`${t.initials}-${t.name}`}
              className="group flex flex-col overflow-hidden border border-white/10 transition-colors duration-300 hover:border-[#C9A84C]/35"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#111]">
                <Image
                  src={testimonialCardImages[i % testimonialCardImages.length]}
                  alt={t.imageAlt}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <div
                  className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/20 to-transparent"
                  aria-hidden
                />
              </div>

              <div className="flex flex-1 flex-col justify-between p-7 md:p-8">
                <div className="font-serif text-4xl leading-none text-[#C9A84C]/35" aria-hidden>
                  &ldquo;
                </div>
                <p className="mb-8 mt-4 flex-1 text-base leading-relaxed text-white/75">{t.quote}</p>
                <div className="flex items-center gap-4 border-t border-white/10 pt-6">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-[#C9A84C]/30 bg-[#C9A84C]/20">
                    <span className="text-xs font-bold tracking-wider text-[#C9A84C]">
                      {t.initials}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{t.name}</p>
                    <p className="mt-0.5 text-xs text-white/40">{t.event}</p>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
        <div className="mt-14 flex flex-col gap-3 border-t border-white/10 pt-10 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="h-px w-8 bg-[#C9A84C]/40" />
            <p className="text-xs uppercase tracking-wide text-white/30">
              Shared with permission from guests & tasting partners
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
