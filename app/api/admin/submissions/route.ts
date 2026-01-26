import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAdmin } from '@/lib/requireAdmin'
import { db } from '@/lib/db'

interface UnifiedSubmission {
  id: string
  type: string
  name: string
  phone: string | null
  email: string | null
  date: string
  status: string
  createdAt: string
  rawData: any // Original data for details
}

// GET - Fetch all submissions with filters, search, and pagination
export async function GET(request: NextRequest) {
  try {
    // Check admin access
    const authError = await requireAdmin(request)
    if (authError) return authError

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'all'
    const status = searchParams.get('status') || 'all'
    const search = searchParams.get('search') || ''
    const startDate = searchParams.get('startDate') || ''
    const endDate = searchParams.get('endDate') || ''
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = 20
    const offset = (page - 1) * limit

    const allSubmissions: UnifiedSubmission[] = []

    // Fetch from booking_inquiries
    if (type === 'all' || type === 'booking') {
      let query = supabaseAdmin
        .from('booking_inquiries')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })

      if (status !== 'all') {
        query = query.eq('status', status)
      }
      if (startDate) {
        query = query.gte('created_at', startDate)
      }
      if (endDate) {
        query = query.lte('created_at', endDate)
      }
      if (search) {
        query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`)
      }

      const { data: bookings, error: bookingsError } = await query

      if (!bookingsError && bookings) {
        bookings.forEach((booking: any) => {
          allSubmissions.push({
            id: booking.id,
            type: 'booking',
            name: booking.name || '',
            phone: booking.phone || null,
            email: booking.email || null,
            date: booking.created_at,
            status: booking.status || 'New',
            createdAt: booking.created_at,
            rawData: booking,
          })
        })
      }
    }

    // Fetch from farmers (farmer applications)
    if (type === 'all' || type === 'farmer') {
      let query = supabaseAdmin
        .from('farmers')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })

      if (status !== 'all') {
        query = query.eq('status', status)
      }
      if (startDate) {
        query = query.gte('created_at', startDate)
      }
      if (endDate) {
        query = query.lte('created_at', endDate)
      }
      if (search) {
        query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`)
      }

      const { data: farmers, error: farmersError } = await query

      if (!farmersError && farmers) {
        farmers.forEach((farmer: any) => {
          allSubmissions.push({
            id: farmer.id,
            type: 'farmer',
            name: farmer.name || '',
            phone: farmer.phone || null,
            email: farmer.email || null,
            date: farmer.created_at,
            status: farmer.status || 'pending',
            createdAt: farmer.created_at,
            rawData: farmer,
          })
        })
      }
    }

    // Fetch from chefs (chef applications)
    if (type === 'all' || type === 'chef') {
      let query = supabaseAdmin
        .from('chefs')
        .select('*', { count: 'exact' })
        .order('application_submitted_at', { ascending: false })

      if (status !== 'all') {
        query = query.eq('status', status)
      }
      if (startDate) {
        query = query.gte('application_submitted_at', startDate)
      }
      if (endDate) {
        query = query.lte('application_submitted_at', endDate)
      }
      if (search) {
        query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`)
      }

      const { data: chefs, error: chefsError } = await query

      if (!chefsError && chefs) {
        chefs.forEach((chef: any) => {
          allSubmissions.push({
            id: chef.id,
            type: 'chef',
            name: chef.name || '',
            phone: chef.phone || null,
            email: chef.email || null,
            date: chef.application_submitted_at || chef.created_at,
            status: chef.status || 'pending',
            createdAt: chef.application_submitted_at || chef.created_at,
            rawData: chef,
          })
        })
      }
    }

    // Fetch from Submission table (generic submissions)
    if (type === 'all' || type === 'submission') {
      try {
        let whereClause: any = {}
        
        if (status !== 'all') {
          // Submission table doesn't have status, skip status filter
        }
        if (startDate) {
          whereClause.createdAt = { gte: new Date(startDate) }
        }
        if (endDate) {
          whereClause.createdAt = { ...whereClause.createdAt, lte: new Date(endDate) }
        }

        const submissions = await db.submission.findMany({
          where: whereClause,
          orderBy: { createdAt: 'desc' },
        })

        submissions.forEach((submission) => {
          // Apply search filter
          if (search) {
            const searchLower = search.toLowerCase()
            const matchesSearch = 
              submission.name?.toLowerCase().includes(searchLower) ||
              submission.email?.toLowerCase().includes(searchLower) ||
              submission.phone?.toLowerCase().includes(searchLower)
            
            if (!matchesSearch) return
          }

          allSubmissions.push({
            id: submission.id,
            type: submission.type || 'submission',
            name: submission.name || '',
            phone: submission.phone || null,
            email: submission.email || null,
            date: submission.createdAt.toISOString(),
            status: 'pending', // Submission table doesn't have status
            createdAt: submission.createdAt.toISOString(),
            rawData: submission,
          })
        })
      } catch (error) {
        console.error('Error fetching Submission table:', error)
        // Continue without Submission table data
      }
    }

    // Sort all submissions by date (newest first)
    allSubmissions.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )

    // Apply pagination
    const total = allSubmissions.length
    const paginatedSubmissions = allSubmissions.slice(offset, offset + limit)

    return NextResponse.json({
      success: true,
      submissions: paginatedSubmissions,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasMore: offset + limit < total,
      },
    })
  } catch (error) {
    console.error('Error in GET /api/admin/submissions:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH - Update submission status
export async function PATCH(request: NextRequest) {
  try {
    // Check admin access
    const authError = await requireAdmin(request)
    if (authError) return authError

    const { id, type, status, follow_up_date } = await request.json()

    if (!id || !type || !status) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: id, type, status' },
        { status: 400 }
      )
    }

    // Determine which table to update based on type
    let tableName = ''
    switch (type) {
      case 'booking':
        tableName = 'booking_inquiries'
        break
      case 'farmer':
        tableName = 'farmers'
        break
      case 'chef':
        tableName = 'chefs'
        break
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid submission type' },
          { status: 400 }
        )
    }

    const updateData: any = { status }
    if (follow_up_date !== undefined && tableName === 'booking_inquiries') {
      updateData.follow_up_date = follow_up_date
    }

    const { data, error } = await supabaseAdmin
      .from(tableName)
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error(`Error updating ${type}:`, error)
      return NextResponse.json(
        { success: false, error: `Failed to update ${type}` },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, submission: data })
  } catch (error) {
    console.error('Error in PATCH /api/admin/submissions:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Delete submission
export async function DELETE(request: NextRequest) {
  try {
    // Check admin access
    const authError = await requireAdmin(request)
    if (authError) return authError

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const type = searchParams.get('type')

    if (!id || !type) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters: id, type' },
        { status: 400 }
      )
    }

    // Determine which table to delete from
    let tableName = ''
    switch (type) {
      case 'booking':
        tableName = 'booking_inquiries'
        break
      case 'farmer':
        tableName = 'farmers'
        break
      case 'chef':
        tableName = 'chefs'
        break
      case 'submission':
        // Use Prisma for Submission table
        try {
          await db.submission.delete({
            where: { id },
          })
          return NextResponse.json({ success: true, message: 'Submission deleted' })
        } catch (error: any) {
          console.error('Error deleting submission:', error)
          return NextResponse.json(
            { success: false, error: 'Failed to delete submission' },
            { status: 500 }
          )
        }
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid submission type' },
          { status: 400 }
        )
    }

    const { error } = await supabaseAdmin
      .from(tableName)
      .delete()
      .eq('id', id)

    if (error) {
      console.error(`Error deleting ${type}:`, error)
      return NextResponse.json(
        { success: false, error: `Failed to delete ${type}` },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, message: 'Submission deleted' })
  } catch (error) {
    console.error('Error in DELETE /api/admin/submissions:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
