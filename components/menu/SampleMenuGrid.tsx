import { PageContainer } from '@/components/ui/PageContainer'
import { bookSection } from '@/components/booking/book-culinary-classes'
import { SignatureDishCard } from './SignatureDishCard'

const DISHES = [
  {
    name: 'Green Seasoning Roasted Chicken',
    description: 'Coconut rice crème · brown stew pan jus',
    tag: 'Gluten-Free',
    imageSrc: '/images/menu/jerk-duck-breast.png',
    imageAlt: 'Green seasoning roasted chicken with coconut rice crème and brown stew pan jus',
  },
  {
    name: 'Escovitch Snapper',
    description: 'Crispy-skin snapper · maple-pickled vegetables · coconut rice crème',
    tag: 'Gluten-Free',
    imageSrc: '/images/menu/escovitch-snapper.png',
    imageAlt: 'Escovitch snapper with maple-pickled vegetables and coconut rice crème',
  },
  {
    name: 'Callaloo Custard Tartlet',
    description: 'Silky callaloo custard · pepper oil · sorrel dot',
    tag: 'Vegetarian',
    imageSrc: '/images/menu/callaloo-tartlet.png',
    imageAlt: 'Callaloo custard tartlets with pepper oil and sorrel dot',
  },
  {
    name: 'Coconut Rice Arancini',
    description: 'Green seasoning aioli · sorrel dust · crisp golden bite',
    tag: 'Vegan · Gluten-Free',
    imageSrc: '/images/menu/coconut-rice-arancini.png',
    imageAlt: 'Coconut rice arancini with green seasoning aioli and sorrel dust',
  },
] as const

export function SampleMenuGrid() {
  return (
    <section className={bookSection}>
      <PageContainer wide>
        <div className="grid gap-8 md:grid-cols-2">
          {DISHES.map((dish) => (
            <SignatureDishCard key={dish.name} {...dish} />
          ))}
        </div>
      </PageContainer>
    </section>
  )
}
