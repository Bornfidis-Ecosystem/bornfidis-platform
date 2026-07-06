import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', 'Montserrat', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['var(--font-serif)', 'Poppins', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        /** Bornfidis Culinary OS — DESIGN.md */
        'culinary-display': ['var(--font-serif)', 'Poppins', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        'culinary-sans': ['var(--font-culinary-ui)', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      spacing: {
        'margin-mobile': '16px',
        'margin-tablet': '32px',
        'margin-desktop': '64px',
        gutter: '24px',
        'stack-sm': '12px',
        'stack-md': '24px',
        'stack-lg': '48px',
        'stack-xl': '80px',
      },
      colors: {
        /** Culinary OS palette — bornfidis/DESIGN.md + stitch references */
        culinary: {
          bone: '#F9F6F1',
          'bone-yaml': '#fcf8fb',
          navy: '#141a32',
          gold: '#c9a060',
          'gold-line': '#e9c176',
          forest: '#2e5c34',
          outline: '#D1CDC7',
          'outline-variant': '#c6c6ce',
          'surface-low': '#f6f3f5',
          'surface-high': '#eae7ea',
          'surface-highest': '#e5e2e4',
          'text-muted': '#474743',
          ink: '#1b1b1d',
          'on-navy': '#f3f0f2',
        },
        // Bornfidis canonical palette — June 2026 (see app/globals.css)
        gold: 'var(--color-gold)',
        bone: 'var(--color-bone)',
        light: 'var(--color-light)',
        mid: 'var(--color-mid)',
        muted: 'var(--color-muted)',
        faint: 'var(--color-faint)',
        rule: 'var(--color-rule)',
        scripture: 'var(--color-scripture)',
        nature: 'var(--color-nature)',
        // Brand tokens live as CSS vars in app/globals.css (navy #002747, gold #ffbc00)
        // Legacy names — aliased to the canonical palette (kept so existing components don't break)
        midnight: 'var(--color-green)',
        harbour: 'var(--color-green)',
        brass: 'var(--color-gold)',
        cream: 'var(--color-bone)',
        greenLight: 'var(--color-green)',
        navy: 'var(--color-navy)',
        navyLight: 'var(--color-navy-light)',
        goldAccent: 'var(--color-gold-accent)',
        goldDark: 'var(--color-gold-dark)',
        forest: 'var(--color-forest)',
        forestDark: 'var(--color-forest-dark)',
        forestDarker: 'var(--color-forest-darker)',
        card: 'var(--color-card)',
        charcoal: 'var(--color-charcoal)',
        grayMedium: 'var(--color-gray-medium)',
        grayLight: 'var(--color-gray-light)',
      },
      borderRadius: {
        none: '0',
        sm: '0',
        DEFAULT: '0',
        md: '0',
        lg: '0',
        xl: '0',
        '2xl': '0',
        full: '9999px',
      },
      boxShadow: {
        none: 'none',
      },
      transitionDuration: {
        refined: '200ms',
      },
      transitionTimingFunction: {
        refined: 'ease-out',
      },
      fontSize: {
        /** DESIGN.md editorial scale (Poppins display / Montserrat UI) */
        'display-lg': ['64px', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '400' }],
        'headline-xl': ['48px', { lineHeight: '1.2', fontWeight: '400' }],
        'headline-lg': ['32px', { lineHeight: '1.3', fontWeight: '400' }],
        'headline-lg-mobile': ['24px', { lineHeight: '1.3', fontWeight: '400' }],
        'title-md': ['18px', { lineHeight: '1.5', letterSpacing: '0.01em', fontWeight: '600' }],
        'body-lg': ['16px', { lineHeight: '1.6', fontWeight: '400' }],
        'body-md': ['14px', { lineHeight: '1.6', fontWeight: '400' }],
        'label-caps': ['12px', { lineHeight: '1.4', letterSpacing: '0.1em', fontWeight: '700' }],
      },
    },
  },
  plugins: [],
}
export default config
