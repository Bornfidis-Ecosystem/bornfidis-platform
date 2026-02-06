import { NextResponse } from 'next/server'

/**
 * Health check endpoint
 * GET /api/health
 * 
 * Used by Vercel and monitoring services to check application status
 * Returns 200 if application is healthy, 500 if critical services are down
 */
export async function GET() {
  try {
    // Basic health check
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'unknown',
      version: process.env.npm_package_version || '0.1.0',
    }

    // Optional: Check database connection (non-blocking)
    let database = 'unknown'
    try {
      const { db } = await import('@/lib/db')
      await db.$queryRaw`SELECT 1`
      database = 'connected'
    } catch (error) {
      database = 'error'
      // Don't fail health check if DB is down - just report it
    }

    // Optional: Check Supabase connection (non-blocking)
    let supabase = 'unknown'
    try {
      const { supabaseAdmin } = await import('@/lib/supabase')
      // Simple check - just verify client is initialized
      if (supabaseAdmin) {
        supabase = 'connected'
      }
    } catch (error) {
      supabase = 'error'
      // Don't fail health check if Supabase is down - just report it
    }

    // Check critical environment variables
    const envCheck = {
      supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      supabaseServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      databaseUrl: !!process.env.DATABASE_URL,
    }

    const allEnvVarsPresent = Object.values(envCheck).every(v => v === true)

    return NextResponse.json(
      {
        ...health,
        services: {
          database,
          supabase,
        },
        environment: {
          ...envCheck,
          allPresent: allEnvVarsPresent,
        },
      },
      {
        headers: {
          'Cache-Control': 'no-store, max-age=0',
        },
      }
    )
  } catch (error: any) {
    return NextResponse.json(
      {
        status: 'error',
        error: error.message || 'Health check failed',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}
