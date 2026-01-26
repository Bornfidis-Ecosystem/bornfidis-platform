import { NextResponse } from 'next/server'

/**
 * Simple connection test - checks if DATABASE_URL is configured correctly
 * This helps debug connection issues without exposing sensitive data
 */
export async function GET() {
  try {
    const dbUrl = process.env.DATABASE_URL

    if (!dbUrl) {
      return NextResponse.json({
        success: false,
        error: 'DATABASE_URL is not set',
        hint: 'Add DATABASE_URL to .env.local file'
      })
    }

    // Check connection string format (without exposing password)
    const urlParts = dbUrl.split('@')
    const userPart = urlParts[0] || ''
    const hostPart = urlParts[1] || ''

    const checks = {
      hasPostgresql: dbUrl.startsWith('postgresql://') || dbUrl.startsWith('postgres://'),
      hasProjectRef: userPart.includes('postgres.axqmavsjdrvhsdjetznb') || userPart.includes('postgres.'),
      hasPassword: userPart.includes(':') && userPart.split(':').length >= 2,
      hasPooler: hostPart.includes('pooler.supabase.com'),
      hasPort6543: hostPart.includes(':6543'),
      hasSslMode: dbUrl.includes('sslmode=require'),
      isSessionMode: !dbUrl.includes('pgbouncer=true'), // Session mode doesn't use pgbouncer=true
    }

    // Try to actually connect
    let connectionTest = { success: false, error: null as string | null }
    try {
      const { PrismaClient } = await import('@prisma/client')
      const testDb = new PrismaClient()
      await testDb.$connect()
      await testDb.$disconnect()
      connectionTest = { success: true, error: null }
    } catch (error: any) {
      connectionTest = { success: false, error: error.message }
    }

    return NextResponse.json({
      success: connectionTest.success,
      connectionStringChecks: checks,
      connectionTest: connectionTest,
      hints: {
        ...(checks.hasPostgresql ? {} : { format: 'Connection string should start with postgresql://' }),
        ...(checks.hasProjectRef ? {} : { username: 'Username should be postgres.axqmavsjdrvhsdjetznb (with dot and project ref)' }),
        ...(checks.hasPassword ? {} : { password: 'Connection string should include password after username' }),
        ...(checks.hasPooler ? {} : { host: 'Host should be aws-X-us-east-X.pooler.supabase.com (with pooler)' }),
        ...(checks.hasPort6543 ? {} : { port: 'Port should be 6543 (Session Pooler), not 5432' }),
        ...(checks.hasSslMode ? {} : { ssl: 'Connection string should end with ?sslmode=require' }),
        ...(checks.isSessionMode ? {} : { mode: 'Should use Session mode (not Transaction pooler with pgbouncer=true)' }),
      },
      error: connectionTest.error
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    })
  }
}
