import Link from 'next/link'

const items = [
  {
    title: 'Signature spice blends',
    blurb: 'Small-batch rubs and seasonings built on the same flavor discipline as our chef experiences.',
    accent: 'from-[#0F3D2E]/90 via-[#1a5c47]/80 to-[#0a2a22]/95',
    icon: 'spice',
  },
  {
    title: 'Chef-crafted sauces',
    blurb: 'Bottle-ready sauces designed for depth, balance, and everyday cooking with intention.',
    accent: 'from-[#5c4a1c]/90 via-[#8b6f2a]/75 to-[#2d2410]/95',
    icon: 'sauce',
  },
  {
    title: 'Giftable gourmet line',
    blurb: 'Thoughtful packaging and limited drops—provisions worth giving and savoring slowly.',
    accent: 'from-[#1e2d28]/88 via-[#25483C]/82 to-[#0f1c18]/95',
    icon: 'gift',
  },
] as const

function JarMock({ variant }: { variant: 'spice' | 'sauce' | 'gift' }) {
  if (variant === 'spice') {
    return (
      <svg viewBox="0 0 120 200" className="h-40 w-24 text-white/90 drop-shadow-lg" aria-hidden>
        <defs>
          <linearGradient id="jar-spice" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.35)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.08)" />
          </linearGradient>
        </defs>
        <rect x="38" y="8" width="44" height="22" rx="6" fill="currentColor" opacity="0.25" />
        <path
          d="M32 36h56c6 0 12 6 12 14v118c0 10-8 18-18 18H38c-10 0-18-8-18-18V50c0-8 6-14 12-14z"
          fill="url(#jar-spice)"
          stroke="currentColor"
          strokeWidth="1.5"
          opacity="0.9"
        />
        <ellipse cx="60" cy="150" rx="22" ry="10" fill="rgba(201,168,76,0.35)" />
      </svg>
    )
  }
  if (variant === 'sauce') {
    return (
      <svg viewBox="0 0 120 220" className="h-44 w-28 text-white/90 drop-shadow-lg" aria-hidden>
        <defs>
          <linearGradient id="bottle" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.4)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.06)" />
          </linearGradient>
        </defs>
        <rect x="44" y="6" width="32" height="38" rx="10" fill="currentColor" opacity="0.22" />
        <path
          d="M40 48h40c8 0 14 7 14 16v128c0 12-10 22-22 22H48c-12 0-22-10-22-22V64c0-9 6-16 14-16z"
          fill="url(#bottle)"
          stroke="currentColor"
          strokeWidth="1.5"
          opacity="0.92"
        />
        <path d="M48 120h24" stroke="rgba(201,168,76,0.5)" strokeWidth="3" strokeLinecap="round" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 140 180" className="h-36 w-36 text-white/90 drop-shadow-lg" aria-hidden>
      <rect
        x="24"
        y="40"
        width="92"
        height="112"
        rx="14"
        fill="rgba(255,255,255,0.12)"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M44 40c0-16 14-28 32-28s32 12 32 28"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        opacity="0.6"
      />
      <rect x="54" y="62" width="32" height="4" rx="2" fill="rgba(201,168,76,0.45)" />
      <rect x="54" y="78" width="48" height="3" rx="1.5" fill="rgba(255,255,255,0.2)" />
      <rect x="54" y="90" width="40" height="3" rx="1.5" fill="rgba(255,255,255,0.15)" />
    </svg>
  )
}

/**
 * Branded “coming soon” mockup for provisions — replaces product photography until SKUs ship.
 */
export default function ProvisionsComingSoonGrid() {
  return (
    <div className="mt-12 grid gap-6 lg:grid-cols-3">
      {items.map((item) => (
        <div
          key={item.title}
          className="group relative overflow-hidden rounded-3xl border border-white/50 bg-[#F7F3EA] shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <div
            className={`relative min-h-[220px] bg-gradient-to-br ${item.accent} px-6 pb-10 pt-8`}
          >
            <div className="pointer-events-none absolute inset-0 opacity-[0.35] bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.35)_0,transparent_45%),radial-gradient(circle_at_80%_70%,rgba(0,0,0,0.35)_0,transparent_50%)]" />
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.35)_0%,transparent_55%)]" />
            <p className="relative text-[11px] font-semibold uppercase tracking-[0.25em] text-[#E8D9B5]/95">
              Coming soon
            </p>
            <div className="relative mt-4 flex justify-center">
              <div className="translate-y-1 scale-105 transition group-hover:scale-110">
                <JarMock variant={item.icon} />
              </div>
            </div>
          </div>

          <div className="border-t border-[#E8E1D2] bg-white/90 p-8 backdrop-blur-sm">
            <h3 className="text-2xl font-semibold text-[#0F3D2E]">{item.title}</h3>
            <p className="mt-4 leading-7 text-[#25483C]">{item.blurb}</p>
          </div>
        </div>
      ))}

      <div className="lg:col-span-3 flex flex-wrap items-center gap-4">
        <Link
          href="/book"
          className="inline-flex rounded-full bg-[#C9A84C] px-6 py-3 font-medium text-[#0F3D2E] transition hover:opacity-90"
        >
          Explore Bornfidis
        </Link>
        <span className="text-sm text-[#25483C]/70">
          Chef experiences and future provisions share the same concierge path.
        </span>
      </div>
    </div>
  )
}
