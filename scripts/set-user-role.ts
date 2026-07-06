/**
 * Set Prisma users.role by email. Usage: npx tsx scripts/set-user-role.ts <email> <ROLE>
 */
import { PrismaClient, UserRole } from '@prisma/client'
import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env.local') })
config({ path: resolve(process.cwd(), '.env') })

const directUrl = process.env.DIRECT_URL || process.env.DATABASE_URL
const email = process.argv[2]?.trim().toLowerCase()
const roleArg = process.argv[3]?.trim().toUpperCase()

if (!directUrl || !email || !roleArg || !(roleArg in UserRole)) {
  console.error('Usage: npx tsx scripts/set-user-role.ts <email> <ROLE>')
  console.error('Roles:', Object.keys(UserRole).join(', '))
  process.exit(1)
}

const prisma = new PrismaClient({ datasources: { db: { url: directUrl } } })

async function main() {
  const existing = await prisma.user.findFirst({ where: { email } })
  if (!existing) {
    console.error(`User not found: ${email}`)
    process.exit(1)
  }
  const user = await prisma.user.update({
    where: { id: existing.id },
    data: { role: roleArg as UserRole },
  })
  console.log(`OK: ${user.email} => ${user.role}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
