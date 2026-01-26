/**
 * Script to set a user's role to ADMIN
 * Usage: npx tsx scripts/set-admin-role.ts <email>
 * 
 * This bypasses the normal role assignment restrictions
 * and directly updates the user's role in the database.
 */

import { db } from '../lib/db'
import { UserRole } from '@prisma/client'

async function setAdminRole(email: string) {
  try {
    console.log(`Looking for user with email: ${email}`)
    
    const user = await db.user.findFirst({
      where: {
        email: email,
      },
    })

    if (!user) {
      console.error(`❌ User with email ${email} not found`)
      console.log('\nAvailable users:')
      const allUsers = await db.user.findMany({
        select: {
          email: true,
          name: true,
          role: true,
        },
      })
      allUsers.forEach((u) => {
        console.log(`  - ${u.email || 'No email'} (${u.name || 'No name'}) - Role: ${u.role || 'FARMER'}`)
      })
      process.exit(1)
    }

    console.log(`Found user: ${user.name || 'No name'} (${user.email})`)
    console.log(`Current role: ${user.role || 'FARMER'}`)

    if (user.role === UserRole.ADMIN) {
      console.log('✅ User is already ADMIN')
      process.exit(0)
    }

    await db.user.update({
      where: { id: user.id },
      data: { role: UserRole.ADMIN },
    })

    console.log(`✅ Successfully updated ${email} to ADMIN role`)
    console.log('\n⚠️  Note: You may need to sign out and sign back in for the change to take effect.')
  } catch (error: any) {
    console.error('❌ Error updating user role:', error.message)
    process.exit(1)
  } finally {
    await db.$disconnect()
  }
}

// Get email from command line arguments
const email = process.argv[2]

if (!email) {
  console.error('❌ Please provide an email address')
  console.log('\nUsage: npx tsx scripts/set-admin-role.ts <email>')
  console.log('\nExample: npx tsx scripts/set-admin-role.ts tech@bornfidis.com')
  process.exit(1)
}

setAdminRole(email)
