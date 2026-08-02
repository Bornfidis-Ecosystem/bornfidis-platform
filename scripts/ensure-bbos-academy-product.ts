/**
 * Ensure an inactive AcademyProduct row exists for BBOS.
 * Does NOT run migrations. Does NOT set active=true or stripePriceId.
 *
 *   npx tsx scripts/ensure-bbos-academy-product.ts
 */
import { PrismaClient } from '@prisma/client'
import { BBOS_LIBRARY_MANIFEST, BBOS_PRODUCT_SLUG } from '../lib/bbos-library-manifest'

const prisma = new PrismaClient()

async function main() {
  const existing = await prisma.academyProduct.findFirst({
    where: { slug: BBOS_PRODUCT_SLUG },
  })

  if (existing) {
    console.log('EXISTS', {
      id: existing.id,
      slug: existing.slug,
      active: existing.active,
      stripePriceId: existing.stripePriceId,
      priceCents: existing.priceCents,
      title: existing.title,
    })

    const needsTitle =
      !existing.title?.trim() ||
      existing.title.toLowerCase().includes('placeholder')
    const needsDescription =
      !existing.description?.trim() ||
      existing.description.toLowerCase().includes('placeholder')

    if (needsTitle || needsDescription) {
      const updated = await prisma.academyProduct.update({
        where: { id: existing.id },
        data: {
          ...(needsTitle ? { title: BBOS_LIBRARY_MANIFEST.title } : {}),
          ...(needsDescription
            ? { description: BBOS_LIBRARY_MANIFEST.description }
            : {}),
        },
      })
      console.log('UPDATED_TITLE_DESCRIPTION_ONLY', {
        id: updated.id,
        title: updated.title,
        active: updated.active,
        stripePriceId: updated.stripePriceId,
      })
    } else {
      console.log('NO_CHANGE')
    }
    return
  }

  const created = await prisma.academyProduct.create({
    data: {
      slug: BBOS_PRODUCT_SLUG,
      title: BBOS_LIBRARY_MANIFEST.title,
      description: BBOS_LIBRARY_MANIFEST.description,
      type: 'DOWNLOAD',
      priceCents: 0,
      stripePriceId: null,
      active: false,
      featured: false,
    },
  })

  console.log('CREATED', {
    id: created.id,
    slug: created.slug,
    active: created.active,
    stripePriceId: created.stripePriceId,
    type: created.type,
  })
}

main()
  .catch((e) => {
    console.error(e)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
