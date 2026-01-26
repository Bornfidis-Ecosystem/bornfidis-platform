import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

/**
 * Test endpoint to verify database write works
 * GET /api/whatsapp/test-write
 * 
 * This creates a test record to verify Prisma + database connectivity
 */
export async function GET() {
  try {
    console.log('🧪 Test write endpoint hit')
    
    const testRecord = await db.farmerIntake.create({
      data: {
        channel: 'test',
        fromPhone: '+10000000000',
        messageText: 'Test write at ' + new Date().toISOString(),
        status: 'received',
      },
    })

    console.log('✅ Test record created:', testRecord.id)

    return NextResponse.json({
      success: true,
      message: 'Test record created successfully',
      recordId: testRecord.id,
      record: testRecord,
    })
  } catch (error: any) {
    console.error('❌ Test write failed:', {
      error: error.message,
      code: error.code,
      meta: error.meta,
      stack: error.stack,
    })

    return NextResponse.json(
      {
        success: false,
        error: error.message,
        code: error.code,
        meta: error.meta,
      },
      { status: 500 }
    )
  }
}
