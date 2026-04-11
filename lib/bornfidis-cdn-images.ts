/**
 * Production-safe image URLs (CloudFront).
 * Use these when `public/images/...` files are not committed — e.g. Vercel deploys.
 */
export const BORNFIDIS_CDN_BASE =
  'https://d2xsxph8kpxj0f.cloudfront.net/98733027/UQF9SVcoDu9WUrxocYn2uP' as const

export const cdnImages = {
  heroPlating: `${BORNFIDIS_CDN_BASE}/bf_hero_plating-Q4siqWWiN2dJrsPg36aB9L.webp`,
  tableAtmosphere: `${BORNFIDIS_CDN_BASE}/bf_table_atmosphere-bcEjpnGnjRAmyk6468tLiS.webp`,
  sauceProduct: `${BORNFIDIS_CDN_BASE}/bf_sauce_product-EBzaKv2hmX58EXcahVJ3tM.webp`,
  chefAction: `${BORNFIDIS_CDN_BASE}/bf_chef_action-9BXPzDRYxeQhLdMochL5QL.webp`,
  servicePrivateDinner: `${BORNFIDIS_CDN_BASE}/bf_hero_plating-Q4siqWWiN2dJrsPg36aB9L.webp`,
  serviceRetreat: `${BORNFIDIS_CDN_BASE}/bf_table_atmosphere-bcEjpnGnjRAmyk6468tLiS.webp`,
  serviceWedding: `${BORNFIDIS_CDN_BASE}/bf_chef_action-9BXPzDRYxeQhLdMochL5QL.webp`,
  iconGold: `${BORNFIDIS_CDN_BASE}/provisions_icon_gold_9f14d9ac.png`,
} as const
