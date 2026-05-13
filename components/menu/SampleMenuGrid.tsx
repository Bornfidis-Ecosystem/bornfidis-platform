import { PageContainer } from '@/components/ui/PageContainer'
import { SampleMenuCard } from './SampleMenuCard'

const CARDS = [
  {
    title: '3-course experience',
    lines: ['Chilled amuse with herbs', 'Protein with seasonal sides', 'Dessert with local accent'],
    note: 'Seasonal; tailored to your occasion and any dietary boundaries.',
  },
  {
    title: 'Five-Course Experience',
    lines: ['Amuse-Bouche', 'Starter', 'Soup or Salad', 'Main Course', 'Dessert'],
    note: 'A sample format; every menu is customized to your event.',
  },
  {
    title: 'Brunch experience',
    lines: ['Breads & spreads', 'Eggs or grain bowl', 'Salad of the moment', 'Lighter sweet finish'],
    note: 'Brunch can be family-style, buffet, or plated — your call.',
  },
] as const

export function SampleMenuGrid() {
  return (
    <section className="py-16 md:py-20" style={{ background: '#0a1210' }}>
      <PageContainer>
        <div className="grid gap-8 md:grid-cols-3">
          {CARDS.map((c) => (
            <SampleMenuCard key={c.title} title={c.title} lines={[...c.lines]} note={c.note} />
          ))}
        </div>
      </PageContainer>
    </section>
  )
}
