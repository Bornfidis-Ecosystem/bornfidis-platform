/**
 * Academy conversion funnel & event tracking.
 * Wire to gtag, Plausible, or your analytics via trackAcademyEvent.
 *
 * Funnel: Homepage → Academy → Product Page → Checkout → Purchase → Download
 */

export type AcademyEventName =
  | 'academy_view'
  | 'academy_product_view'
  | 'academy_buy_click'
  | 'academy_checkout_complete'
  | 'academy_download_click'

export interface AcademyEventProps {
  product_slug?: string
  product_title?: string
  product_price?: string
  category?: string
  source?: string
}

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
    dataLayer?: unknown[]
  }
}

function getBaseUrl(): string {
  if (typeof window === 'undefined') return ''
  return window.location.origin
}

/**
 * Send Academy event to analytics. Override or extend in your app.
 * - gtag: window.gtag('event', name, { ...props, send_to: 'G-XXX' })
 * - Plausible: window.plausible?.(name, { props })
 */
export function trackAcademyEvent(
  name: AcademyEventName,
  props?: AcademyEventProps
): void {
  const payload = { ...props, page: typeof window !== 'undefined' ? window.location.pathname : '' }
  if (typeof window === 'undefined') return
  try {
    if (window.gtag) {
      window.gtag('event', name, payload)
    }
    if (window.dataLayer) {
      window.dataLayer.push({ event: name, ...payload })
    }
    if (process.env.NODE_ENV === 'development') {
      console.debug('[Academy analytics]', name, payload)
    }
  } catch (e) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[Academy analytics]', e)
    }
  }
}

export function trackAcademyView(): void {
  trackAcademyEvent('academy_view', { source: document.referrer || 'direct' })
}

export function trackAcademyProductView(slug: string, title: string, priceDisplay?: string, category?: string): void {
  trackAcademyEvent('academy_product_view', {
    product_slug: slug,
    product_title: title,
    product_price: priceDisplay,
    category,
  })
}

export function trackAcademyBuyClick(slug: string, title: string, priceDisplay?: string): void {
  trackAcademyEvent('academy_buy_click', {
    product_slug: slug,
    product_title: title,
    product_price: priceDisplay,
  })
}

export function trackAcademyCheckoutComplete(slug: string, title: string): void {
  trackAcademyEvent('academy_checkout_complete', {
    product_slug: slug,
    product_title: title,
  })
}

export function trackAcademyDownloadClick(slug: string, title: string, source: 'success_page' | 'library'): void {
  trackAcademyEvent('academy_download_click', {
    product_slug: slug,
    product_title: title,
    source,
  })
}
