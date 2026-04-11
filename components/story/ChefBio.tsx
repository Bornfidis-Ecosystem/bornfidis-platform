import Image from 'next/image'
import { chefBioPortrait } from '@/lib/book-marketing-images'

const credentials = [
  { label: 'Royal Caribbean International', sub: 'Shipboard Culinary — 2,000+ guests daily' },
  { label: 'Grand Hyatt Vail', sub: 'Luxury Resort · Vail, Colorado' },
  { label: 'Jamaica Observer Food Awards', sub: 'Award-winning chef' },
  { label: 'Embassy & Diplomatic Catering', sub: 'High-protocol private events' },
  { label: 'Bornfidis Provisions', sub: 'Founder · Port Antonio, Jamaica' },
] as const

/** Dark / gold / all-caps brutalist block — Story page, directly below hero */
export function ChefBio() {
  return (
    <section id="chef-bio" className="bg-black px-6 py-24 text-white md:px-16">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 items-start gap-14 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <p className="mb-6 text-xs uppercase tracking-[0.2em] text-[#C9A84C]">The Chef</p>
            <h2 className="font-display mb-8 text-5xl font-black uppercase leading-none md:text-6xl">
              Brian
              <br />
              Maylor
            </h2>

            <figure className="relative mx-auto aspect-[3/4] w-full max-w-md overflow-hidden border border-[#C9A84C]/25 lg:mx-0 lg:max-w-none">
              <Image
                src={chefBioPortrait}
                alt="Jerk-style chicken, sides, and sauces — kitchen line ready for service"
                fill
                className="object-cover object-center"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/10"
                aria-hidden
              />
            </figure>

            <div className="mt-12 space-y-3">
              {credentials.map((c) => (
                <div
                  key={c.label}
                  className="flex items-center gap-4 border border-[#C9A84C]/20 px-5 py-3"
                >
                  <div className="h-8 w-1 flex-shrink-0 bg-[#C9A84C]" />
                  <div>
                    <p className="text-sm font-medium tracking-wide text-white">{c.label}</p>
                    <p className="mt-0.5 text-xs text-white/40">{c.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-7 lg:pt-4">
            <p className="mb-6 text-sm uppercase tracking-[0.15em] text-white/60">Origin</p>

            <p className="mb-6 text-lg leading-relaxed text-white/90">It started at sea.</p>

            <p className="mb-6 text-base leading-relaxed text-white/70">
              As a chef aboard Royal Caribbean, I cooked for thousands of guests every single day —
              multiple restaurants, multiple cuisines, zero margin for error. That pressure didn&apos;t
              break the craft. It sharpened it.
            </p>

            <p className="mb-6 text-base leading-relaxed text-white/70">
              I learned that great food isn&apos;t about the size of the kitchen or the number of
              covers. It&apos;s about intention — knowing exactly what you&apos;re serving, why it
              matters, and who it&apos;s for. Every plate is a decision.
            </p>

            <p className="mb-10 text-base leading-relaxed text-white/70">
              Bornfidis was built on that foundation. We bring the discipline of a world-class galley
              and the soul of Jamaican farm-to-table cooking into your home, villa, or event space. No
              shortcuts. No compromise. Just an experience worth remembering.
            </p>

            <div className="border-t border-[#C9A84C]/20 pt-8">
              <p className="mb-1 text-xs uppercase tracking-[0.2em] text-[#C9A84C]">Available in</p>
              <p className="text-sm text-white/60">
                Port Antonio, Jamaica · Vermont, USA · Private travel on request
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
