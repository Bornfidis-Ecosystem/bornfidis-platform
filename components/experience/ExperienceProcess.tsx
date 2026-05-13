import { PageContainer } from '@/components/ui/PageContainer'

const STEPS = [
  { step: '1', title: 'Inquiry', body: 'Share your event details and vision.' },
  { step: '2', title: 'Proposal & Confirmation', body: 'Receive a customized menu and secure your date with a deposit.' },
  { step: '3', title: 'Experience Day', body: 'We arrive, prepare, and deliver a seamless dining experience.' },
] as const

export function ExperienceProcess() {
  return (
    <section className="border-t border-brass/15 py-16 md:py-20" style={{ backgroundColor: '#0f1814' }}>
      <PageContainer>
        <h2 className="font-display text-2xl text-cream md:text-3xl">The process</h2>
        <ol className="mt-10 grid gap-8 md:grid-cols-3">
          {STEPS.map((s) => (
            <li key={s.step} className="border-l-2 border-brass/30 pl-6">
              <span className="text-xs font-semibold uppercase tracking-wider text-brass">Step {s.step}</span>
              <h3 className="mt-2 font-display text-xl text-cream">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-cream/70">{s.body}</p>
            </li>
          ))}
        </ol>
      </PageContainer>
    </section>
  )
}
