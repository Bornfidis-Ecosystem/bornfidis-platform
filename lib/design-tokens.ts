/**
 * Design token values for non-CSS usage (e.g. PDFs, inline styles).
 * CSS source of truth remains app/globals.css and Tailwind theme.
 */

export { wordpressAlignedBrand } from './wp-platform-integration'

export const colors = {
  forest: '#2E6B4F',
  gold: '#C8963E',
  goldAccent: '#E8C97A',
  navy: '#0D1F2D',
  card: '#F0EAD6',
  white: '#FFFFFF',
  forestDark: '#2E6B4F',
  forestDarker: '#23533D',
  goldDark: '#D4A850',
} as const;
