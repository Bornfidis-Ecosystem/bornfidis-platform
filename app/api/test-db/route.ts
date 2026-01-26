import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

/**
 * Test database connectivity endpoint
 * GET /api/test-db
 */
export async function GET() {
  try {
    // Test 1: Check DATABASE_URL is loaded
    const dbUrl = process.env.DATABASE_URL
    if (!dbUrl) {
      return NextResponse.json(
        { 
          error: 'DATABASE_URL not found in environment',
          envKeys: Object.keys(process.env).filter(k => k.includes('DATABASE')),
          hint: 'Make sure .env.local exists in project root with DATABASE_URL set'
        },
        { status: 500 }
      )
    }

    // Test 2: Check if connection string looks correct (not localhost)
    if (dbUrl.includes('localhost') || dbUrl.includes('127.0.0.1')) {
      return NextResponse.json(
        { 
          error: 'DATABASE_URL points to localhost',
          dbUrl: dbUrl.replace(/:[^:@]+@/, ':****@'), // Mask password
          hint: 'DATABASE_URL should point to Supabase, not localhost. Check .env.local file.'
        },
        { status: 500 }
      )
    }

    // Test 2.5: Check connection string format
    const maskedUrl = dbUrl.replace(/:[^:@]+@/, ':****@')
    const hasSslMode = dbUrl.includes('sslmode=')
    const isPostgresql = dbUrl.startsWith('postgresql://') || dbUrl.startsWith('postgres://')
    
    if (!isPostgresql) {
      return NextResponse.json(
        {
          error: 'Invalid DATABASE_URL format',
          dbUrl: maskedUrl,
          hint: 'DATABASE_URL must start with postgresql:// or postgres://'
        },
        { status: 500 }
      )
    }

    // Test 3: Try to query farmer_intakes table
    const count = await db.farmerIntake.count()
    
    // Test 4: Try to insert a test record (then delete it)
    const testRecord = await db.farmerIntake.create({
      data: {
        channel: 'test',
        fromPhone: '+10000000000',
        messageText: 'Test connectivity',
        status: 'received',
      },
    })

    // Clean up test record
    await db.farmerIntake.delete({
      where: { id: testRecord.id },
    })

    // Test 5: Test new Prisma models (from Drizzle migration)
    const newModels = {
      users: await db.user.count(),
      submissions: await db.submission.count(),
      phases: await db.phase.count(),
      months: await db.month.count(),
      deliverables: await db.deliverable.count(),
      metrics: await db.metric.count(),
    }

    return NextResponse.json({
      success: true,
      message: 'Database connectivity test passed',
      tests: {
        envLoaded: true,
        connectionStringValid: true,
        tableReadable: true,
        tableWritable: true,
      },
      farmerIntakesCount: count,
      newModels, // New Prisma models from Drizzle migration
      connectionInfo: {
        host: dbUrl.split('@')[1]?.split('/')[0] || 'masked',
        hasSslMode: dbUrl.includes('sslmode='),
        format: isPostgresql ? 'valid' : 'invalid'
      }
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        code: error.code,
        meta: error.meta,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    )
  }
}
