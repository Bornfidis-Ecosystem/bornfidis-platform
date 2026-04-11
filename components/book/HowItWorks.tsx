import Link from 'next/link'

const STEPS = [
  {
    num: '01',
    title: 'Inquiry',
    desc:
      'Tell us about your event — the occasion, guest count, location, and any dietary needs. Takes under two minutes.',
  },
  {
    num: '02',
    title: 'Custom Proposal',
    desc:
      "Within hours you'll receive a detailed quote tailored to your event — service type, menu direction, and pricing. No generic packages.",
  },
  {
    num: '03',
    title: 'Secure Your Date',
    desc:
      'A 50% deposit confirms your booking and reserves Chef Brian exclusively for your event. Your date is held for no one else.',
  },
  {
    num: '04',
    title: 'Menu & Experience Planning',
    desc:
      'We work with you to design every detail — courses, dietary requirements, table setting, and the story behind each dish.',
  },
  {
    num: '05',
    title: 'Your Private Dining Experience',
    desc:
      'We arrive, set up, cook, serve, and leave your space cleaner than we found it. You experience the meal. We handle everything else.',
  },
] as const

/** Five-step process — dark / gold; place above booking form on /book */
export function HowItWorks() {
  return (
    <section className="bg-[#0a0a0a] px-6 py-24 text-white md:px-16">
      <div className="mx-auto max-w-6xl">
        <div className="mb-16">
          <p className="mb-4 text-xs uppercase tracking-[0.2em] text-[#C9A84C]">The Process</p>
          <h2 className="font-display text-4xl font-black uppercase leading-none md:text-5xl">
            How It Works
          </h2>
        </div>

        <div className="relative">
          <div className="absolute bottom-0 left-[2.25rem] top-0 hidden w-px bg-[#C9A84C]/15 md:block" />

          <div className="space-y-0">
            {STEPS.map((step, i) => (
              <div key={step.num} className="group relative flex items-start gap-8 md:gap-12">
                <div className="relative z-10 flex-shrink-0">
                  <div className="flex h-[4.5rem] w-[4.5rem] items-center justify-center border border-[#C9A84C]/30 bg-black transition-colors duration-300 group-hover:border-[#C9A84C]/70">
                    <span className="font-mono text-sm font-bold tracking-widest text-[#C9A84C]">
                      {step.num}
                    </span>
                  </div>
                </div>

                <div className={`flex-1 pb-12 ${i === STEPS.length - 1 ? 'pb-0' : ''}`}>
                  <h3 className="font-display mb-3 mt-4 text-xl font-black uppercase tracking-wide text-white">
                    {step.title}
                  </h3>
                  <p className="max-w-xl text-base leading-relaxed text-white/60">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 flex flex-col items-start gap-6 border-t border-[#C9A84C]/15 pt-12 sm:flex-row sm:items-center">
          <div>
            <p className="text-lg font-medium text-white/90">Ready to start planning?</p>
            <p className="mt-1 text-sm text-white/40">Most inquiries receive a proposal within 4 hours.</p>
          </div>
          <Link
            href="#booking-form"
            className="flex-shrink-0 border border-[#C9A84C] px-8 py-3 text-sm font-bold uppercase tracking-[0.15em] text-[#C9A84C] transition-colors duration-200 hover:bg-[#C9A84C] hover:text-black"
          >
            Begin Your Inquiry
          </Link>
        </div>
      </div>
    </section>
  )
}
