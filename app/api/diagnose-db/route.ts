import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/**
 * Diagnostic endpoint to check what actually exists in the database
 * This will tell us EXACTLY what's wrong
 */
export async function GET() {
  try {
    // Check environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({
        success: false,
        error: 'Missing Supabase environment variables',
        hasUrl: !!supabaseUrl,
        hasKey: !!supabaseKey,
        hint: 'Check .env.local for NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY'
      })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Test 1: Can we connect? (Skip RPC - not needed)
    // Test 2: Try to list tables using information_schema (Skip - not accessible via Supabase client)

    // Test 3: Check if farmer_intakes table exists
    let farmerIntakesExists = false
    let farmerIntakesColumns: any[] = []
    let farmerIntakesError: any = null

    try {
      const { data, error } = await supabase
        .from('farmer_intakes')
        .select('*')
        .limit(0) // Just check if table exists
      
      if (!error) {
        farmerIntakesExists = true
        // Column info not available via Supabase client - would need direct SQL
      } else {
        farmerIntakesError = error
      }
    } catch (e: any) {
      farmerIntakesError = { message: e.message }
    }

    // Test 4: Check if whatsapp_messages table exists (simpler alternative)
    let whatsappMessagesExists = false
    let whatsappMessagesError: any = null

    try {
      const { data, error } = await supabase
        .from('whatsapp_messages')
        .select('*')
        .limit(0)
      
      if (!error) {
        whatsappMessagesExists = true
      } else {
        whatsappMessagesError = error
      }
    } catch (e: any) {
      whatsappMessagesError = { message: e.message }
    }

    // Test 5: Try a simple insert test (if table exists)
    let insertTest: any = { attempted: false }
    if (whatsappMessagesExists) {
      try {
        const { data, error } = await supabase
          .from('whatsapp_messages')
          .insert({
            phone_number: '+1876TEST',
            message_text: 'Diagnostic test',
            farmer_name: 'Test'
          })
          .select()
        
        insertTest = {
          attempted: true,
          success: !error,
          error: error?.message,
          data: data?.[0]
        }

        // Clean up if successful
        if (data && data[0]?.id) {
          await supabase
            .from('whatsapp_messages')
            .delete()
            .eq('id', data[0].id)
        }
      } catch (e: any) {
        insertTest = {
          attempted: true,
          success: false,
          error: e.message
        }
      }
    }

    return NextResponse.json({
      success: true,
      diagnostics: {
        connection: {
          supabaseUrl: supabaseUrl ? '✅ Set' : '❌ Missing',
          supabaseKey: supabaseKey ? '✅ Set' : '❌ Missing'
        },
        tables: {
          farmer_intakes: {
            exists: farmerIntakesExists,
            error: farmerIntakesError?.message,
            columns: farmerIntakesColumns.length > 0 ? farmerIntakesColumns : 'Cannot determine'
          },
          whatsapp_messages: {
            exists: whatsappMessagesExists,
            error: whatsappMessagesError?.message
          }
        },
        insertTest,
        schemaInfo: schemaError ? schemaError.message : 'Could not query schema',
        recommendation: getRecommendation(farmerIntakesExists, whatsappMessagesExists, farmerIntakesError)
      }
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 })
  }
}

function getRecommendation(farmerIntakesExists: boolean, whatsappMessagesExists: boolean, farmerIntakesError: any): string {
  if (farmerIntakesExists) {
    return '✅ farmer_intakes table exists. Prisma should work. Check if columns match schema.'
  }
  
  if (whatsappMessagesExists) {
    return '✅ whatsapp_messages table exists. Use Supabase client directly (simpler).'
  }
  
  if (farmerIntakesError?.message?.includes('does not exist')) {
    return '❌ farmer_intakes table does not exist. Apply Prisma migration OR create whatsapp_messages table.'
  }
  
  return '⚠️ Unknown state. Check Supabase Dashboard → Table Editor to see what tables exist.'
}
