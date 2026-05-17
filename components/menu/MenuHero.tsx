import { PageContainer } from '@/components/ui/PageContainer'
import { bookBody, bookEyebrow, bookHeadline, bookSection } from '@/components/booking/book-culinary-classes'

export function MenuHero() {
  return (
    <header className={`${bookSection} border-t-0 pt-28 md:pt-32`}>
      <PageContainer wide>
        <p className={bookEyebrow}>Bornfidis Provisions</p>
        <h1 className={`${bookHeadline} mt-4 text-[clamp(2rem,5vw,3.25rem)]`}>A Glimpse of the Table</h1>
        <p className={`${bookBody} mt-6 max-w-2xl`}>
          Every menu is written for your occasion. These are the dishes that define how Bornfidis cooks.
        </p>
      </PageContainer>
    </header>
  )
}
