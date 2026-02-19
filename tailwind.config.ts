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
        // Brand Style Guide (docs/BRAND_STYLE_GUIDE.md)
        navy: 'var(--color-navy)',
        navyLight: 'var(--color-navy-light)',
        gold: 'var(--color-gold)',
        goldAccent: 'var(--color-gold-accent)',
        goldDark: 'var(--color-gold-dark)',
        forest: 'var(--color-forest)',
        forestDark: 'var(--color-forest-dark)',
        forestDarker: 'var(--color-forest-darker)',
        cream: 'var(--color-cream)',
        card: 'var(--color-card)',
        charcoal: 'var(--color-charcoal)',
        grayMedium: 'var(--color-gray-medium)',
        grayLight: 'var(--color-gray-light)',
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
