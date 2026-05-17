import { PageContainer } from '@/components/ui/PageContainer'
import { bookEyebrow, bookSection } from '@/components/booking/book-culinary-classes'

export function ExperienceSignatureMoment() {
  return (
    <section className={bookSection}>
      <PageContainer wide>
        <div
          className="border-l-4 border-[#C9993F] px-8 py-10 md:px-12 md:py-14"
          style={{ backgroundColor: '#0D1B2A' }}
        >
          <p className={`${bookEyebrow} text-[#E8C882]`}>The Signature Moment</p>
          <div className="mt-6 max-w-3xl space-y-5 font-display text-lg font-light italic leading-relaxed text-[#F5F0E8] md:text-xl">
            <p>
              At every Bornfidis event, Chef Brian brings a stone mortar to the table. Whole Portland Parish
              allspice berries are bruised with fresh thyme and scotch bonnet. The smell fills the room within
              seconds. He says two sentences about where it came from. Then he leaves the mortar on the table.
            </p>
            <p>
              Guests smell it for the rest of the meal. This is the moment they describe to other people the
              next day.
            </p>
          </div>
        </div>
      </PageContainer>
    </section>
  )
}
