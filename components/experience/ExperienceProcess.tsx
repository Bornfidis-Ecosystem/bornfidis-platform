import { PageContainer } from '@/components/ui/PageContainer'
import { bookBody, bookHeadline, bookSection } from '@/components/booking/book-culinary-classes'

const STEPS = [
  { step: '1', title: 'Inquiry', body: 'Share your event details and vision.' },
  { step: '2', title: 'Proposal & Confirmation', body: 'Receive a customized menu and secure your date with a deposit.' },
  { step: '3', title: 'Experience Day', body: 'We arrive, prepare, and deliver a seamless dining experience.' },
] as const

export function ExperienceProcess() {
  return (
    <section className={bookSection}>
      <PageContainer wide>
        <h2 className={`${bookHeadline} text-2xl md:text-3xl`}>The process</h2>
        <ol className="mt-10 grid gap-8 md:grid-cols-3">
          {STEPS.map((s) => (
            <li key={s.step} className="border-l-2 border-[#C9A84C]/50 pl-6">
              <span className="font-sans text-[12px] font-semibold uppercase tracking-[0.1em] text-[#C9A84C]">
                Step {s.step}
              </span>
              <h3 className={`${bookHeadline} mt-2 text-xl`}>{s.title}</h3>
              <p className={`${bookBody} mt-2 text-sm`}>{s.body}</p>
            </li>
          ))}
        </ol>
      </PageContainer>
    </section>
  )
}
