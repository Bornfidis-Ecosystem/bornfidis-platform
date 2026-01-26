import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

/**
 * Diagnostic endpoint to check WhatsApp messages table
 */
export async function GET() {
  try {
    // Get count and latest messages using Prisma
    const [messageCount, messages] = await Promise.all([
      db.whatsAppMessage.count(),
      db.whatsAppMessage.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ])

    return NextResponse.json({
      success: true,
      tableExists: true,
      messageCount,
      latestMessages: messages,
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      hint: 'Table might not exist. Run Prisma migrations to create it.'
    })
  }
}
