import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

/**
 * Phase 11G: Portland contact form submission
 * POST /api/portland/contact
 * 
 * Public route - accepts contact form submissions
 */
const contactSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional().nullable(),
  message: z.string().min(10, 'Message must be at least 10 characters'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = contactSchema.parse(body)

    // In a real implementation, you would:
    // 1. Save to database
    // 2. Send email notification
    // 3. Add to CRM system
    
    // For now, just return success
    console.log('Portland contact form submission:', validated)

    return NextResponse.json({
      success: true,
      message: 'Contact form submitted successfully. We will get back to you soon.',
    })
  } catch (error: any) {
    console.error('Error in Portland contact API:', error)
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: 'Invalid form data: ' + error.errors.map((e: any) => e.message).join(', ') },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: error.message || 'Failed to submit contact form' },
      { status: 500 }
    )
  }
}
