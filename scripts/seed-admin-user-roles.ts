/**
 * Upsert core Bornfidis ops roles (idempotent). Run: npx tsx scripts/seed-admin-user-roles.ts
 * Requires DATABASE_URL or DIRECT_URL in env.
 */
import { PrismaClient } from '@prisma/client'
import type { AppRole } from '@prisma/client'
import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env.local') })
config({ path: resolve(process.cwd(), '.env') })

const directUrl = process.env.DIRECT_URL || process.env.DATABASE_URL
if (!directUrl) {
  console.error('Missing DIRECT_URL or DATABASE_URL')
  process.exit(1)
}

const prisma = new PrismaClient({
  datasources: { db: { url: directUrl } },
})

/** String literals avoid relying on the generated `AppRole` enum object at runtime (stale client-safe). */
const rows: { email: string; role: AppRole }[] = [
  { email: 'brian@bornfidis.com', role: 'founder_admin' },
  { email: 'tech@bornfidis.com', role: 'founder_admin' },
  { email: 'caryll@bornfidis.com', role: 'operations_coordinator' },
  { email: 'bornfidisprovisions@gmail.com', role: 'manager' },
]

async function main() {
  for (const { email, role } of rows) {
    const e = email.trim().toLowerCase()
    await prisma.adminUserRole.upsert({
      where: { email: e },
      create: { email: e, role, active: true },
      update: { role, active: true },
    })
    console.log(`OK: ${e} => ${role}`)
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
