import { PrismaClient } from '@prisma/client'

/**
 * Prisma Client Singleton — single instance for the entire app.
 * Prevents multiple instances in development (hot reload) and production.
 *
 * Note: Prisma automatically loads DATABASE_URL from environment variables.
 * Next.js automatically loads .env.local in development and production.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function getDatabaseUrl(): string {
  const dbUrl = process.env.DATABASE_URL
  
  if (!dbUrl) {
    throw new Error(
      'DATABASE_URL is not set in environment variables.\n' +
      'Please add it to .env.local file:\n' +
      'DATABASE_URL="postgresql://postgres:PASSWORD@db.PROJECT_REF.supabase.co:5432/postgres?sslmode=require"\n\n' +
      'To get your connection string:\n' +
      '1. Go to Supabase Dashboard → Project Settings → Database\n' +
      '2. Copy the "Direct connection" string (not pooled)\n' +
      '3. Restart your dev server after updating .env.local'
    )
  }

  // Validate format
  if (!dbUrl.startsWith('postgresql://') && !dbUrl.startsWith('postgres://')) {
    throw new Error(
      `DATABASE_URL must start with postgresql:// or postgres://\n` +
      `Current value: ${dbUrl.substring(0, 20)}...\n\n` +
      `Please check your .env.local file and ensure it uses the correct format:\n` +
      `DATABASE_URL="postgresql://postgres:PASSWORD@db.PROJECT_REF.supabase.co:5432/postgres?sslmode=require"`
    )
  }

  // Warn if DATABASE_URL points to localhost (common mistake)
  if (dbUrl.includes('localhost') || dbUrl.includes('127.0.0.1')) {
    console.warn(
      '⚠️  WARNING: DATABASE_URL points to localhost. This is likely incorrect for Supabase.\n' +
      'Expected format: postgresql://postgres:PASSWORD@db.PROJECT_REF.supabase.co:5432/postgres?sslmode=require'
    )
  }

  // Warn if using direct connection (port 5432) - may not be IPv4 compatible
  if (dbUrl.includes(':5432') && !dbUrl.includes('pooler')) {
    console.warn(
      '⚠️  WARNING: Using direct connection (port 5432) which is NOT IPv4 compatible.\n' +
      'If you see connection errors, switch to Session Pooler (port 6543):\n' +
      'Format: postgresql://postgres.PROJECT_REF:PASSWORD@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require\n' +
      'Get it from: Supabase Dashboard → Settings → Database → Connection pooling → Session mode'
    )
  }

  // Ensure SSL mode is set (required for Supabase)
  let finalUrl = dbUrl
  if (!finalUrl.includes('sslmode=')) {
    const separator = finalUrl.includes('?') ? '&' : '?'
    finalUrl = `${finalUrl}${separator}sslmode=require`
    console.log('ℹ️  Added sslmode=require to DATABASE_URL for Supabase connection')
  }

  // If using PGBouncer (pooled connection on port 6543), disable prepared statements
  // This prevents "prepared statement already exists" errors (PostgresError 42P05)
  if (finalUrl.includes(':6543') || finalUrl.includes('pooler.supabase.com')) {
    if (!finalUrl.includes('pgbouncer=true')) {
      const separator = finalUrl.includes('?') ? '&' : '?'
      finalUrl = `${finalUrl}${separator}pgbouncer=true`
      console.log('ℹ️  Added pgbouncer=true to disable prepared statements for pooled connection')
    }
  }

  return finalUrl
}

// Initialize Prisma Client with validated DATABASE_URL
function createPrismaClient() {
  const dbUrl = getDatabaseUrl()
  
  return new PrismaClient({
    datasources: {
      db: {
        url: dbUrl,
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    // Disable prepared statements when using PGBouncer (pooled connections)
    // This prevents "prepared statement already exists" errors (PostgresError 42P05)
    // Prisma will automatically detect pgbouncer=true in the connection string
  })
}

// Singleton: reuse existing client or create once
export const db = globalForPrisma.prisma ?? createPrismaClient()
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
