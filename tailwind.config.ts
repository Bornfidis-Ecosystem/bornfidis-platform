import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: 'var(--color-navy, #002747)',
        gold: 'var(--color-gold, #FFBC00)',
        forest: 'var(--color-forest, #2D5016)',
        goldAccent: 'var(--color-gold-accent, #C9A24D)',
        card: 'var(--color-card, #F8F6F1)',
        forestDark: 'var(--color-forest-dark, #1a5f3f)',
        forestDarker: 'var(--color-forest-darker, #154a32)',
        goldDark: 'var(--color-gold-dark, #e6a500)',
      },
      transitionDuration: {
        refined: '200ms',
      },
      transitionTimingFunction: {
        refined: 'ease-out',
      },
    },
  },
  plugins: [],
}
export default config
