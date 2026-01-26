import { PrismaClient } from '@prisma/client'
import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { resolve } from 'path'

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') })
// Also try .env as fallback
config({ path: resolve(process.cwd(), '.env') })

// Use DIRECT_URL for Prisma in seed script to avoid pooler issues
// Poolers don't support prepared statements which Prisma uses
const directUrl = process.env.DIRECT_URL || process.env.DATABASE_URL
if (!directUrl) {
  throw new Error('Missing DIRECT_URL or DATABASE_URL environment variable')
}

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: directUrl,
    },
  },
})

// Initialize Supabase Admin client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function main() {
  console.log('🌱 Starting seed...')

  // Admin user configuration
  const adminEmail = 'tech@bornfidis.com'
  const adminName = 'Bornfidis Admin'
  const adminRole = 'admin' // Lowercase for Supabase Auth
  const adminPassword = process.env.ADMIN_INITIAL_PASSWORD || 'ChangeMe123!' // Temporary password

  try {
    // Step 1: Create or update user in Supabase Auth
    console.log('📧 Checking Supabase Auth user...')
    
    // Check if user exists in Supabase Auth
    const { data: existingAuthUsers } = await supabaseAdmin.auth.admin.listUsers()
    const existingAuthUser = existingAuthUsers?.users?.find(u => u.email === adminEmail)

    let authUserId: string

    if (existingAuthUser) {
      console.log(`✅ Supabase Auth user already exists: ${adminEmail}`)
      authUserId = existingAuthUser.id

      // Update user metadata with admin role
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(authUserId, {
        user_metadata: {
          role: adminRole,
          name: adminName,
        },
      })

      if (updateError) {
        console.error('⚠️  Warning: Could not update user metadata:', updateError.message)
      } else {
        console.log(`✅ Updated Supabase Auth user role to: ${adminRole}`)
      }
    } else {
      // Create new user in Supabase Auth
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: adminEmail,
        password: adminPassword,
        email_confirm: true, // Auto-confirm email
        user_metadata: {
          role: adminRole,
          name: adminName,
        },
      })

      if (createError) {
        throw new Error(`Failed to create Supabase Auth user: ${createError.message}`)
      }

      authUserId = newUser.user.id
      console.log(`✅ Created Supabase Auth user: ${adminEmail} (ID: ${authUserId})`)
      console.log(`⚠️  Temporary password: ${adminPassword}`)
      console.log(`⚠️  IMPORTANT: Change this password after first login!`)
    }

    // Step 2: Create or update user in Prisma User table
    console.log('💾 Syncing Prisma User table...')
    
    const existingPrismaUser = await prisma.user.findFirst({
      where: { email: adminEmail },
    })

    if (existingPrismaUser) {
      // Update existing Prisma user
      await prisma.user.update({
        where: { id: existingPrismaUser.id },
        data: {
          name: adminName,
          role: 'ADMIN', // Uppercase for Prisma
          openId: authUserId, // Link to Supabase Auth user
        },
      })
      console.log(`✅ Updated Prisma User record`)
    } else {
      // Create new Prisma user
      const prismaUser = await prisma.user.create({
        data: {
          email: adminEmail,
          name: adminName,
          role: 'ADMIN', // Uppercase for Prisma
          openId: authUserId, // Link to Supabase Auth user
        },
      })
      console.log(`✅ Created Prisma User record (ID: ${prismaUser.id})`)
    }

    console.log('✨ Seed completed successfully!')
    console.log('')
    console.log('📝 Next steps:')
    console.log(`   1. Go to http://localhost:3000/admin/login`)
    console.log(`   2. Login with: ${adminEmail}`)
    console.log(`   3. Password: ${adminPassword}`)
    console.log(`   4. Change password after first login!`)
  } catch (error: any) {
    console.error('❌ Seed failed:', error.message)
    throw error
  }
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
