import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { sendSMS } from '@/lib/twilio'

/**
 * Phase 11G.2: Twilio Voice Status Callback
 * POST /api/twilio/voice/status
 * 
 * Webhook called by Twilio when call status changes
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const callSid = formData.get('CallSid')?.toString()
    const callStatus = formData.get('CallStatus')?.toString()
    const callDuration = formData.get('CallDuration')?.toString()

    if (!callSid) {
      return NextResponse.json({ success: false, error: 'Missing CallSid' }, { status: 400 })
    }

    // Find call log by CallSid
    const { data: callLog, error: findError } = await supabaseAdmin
      .from('farmer_call_logs')
      .select('*, farmers_applications!inner(phone, name)')
      .eq('call_sid', callSid)
      .single()

    if (findError || !callLog) {
      console.warn('Call log not found for CallSid:', callSid)
      return NextResponse.json({ success: true, message: 'Call log not found' })
    }

    // Update call log
    const updateData: any = {
      call_status: callStatus,
    }

    if (callDuration) {
      updateData.call_duration_seconds = parseInt(callDuration, 10)
    }

    if (callStatus === 'completed') {
      updateData.completed_at = new Date().toISOString()
      
      // Determine call outcome based on duration
      if (callDuration && parseInt(callDuration, 10) > 10) {
        updateData.call_outcome = 'connected'
      } else {
        updateData.call_outcome = 'no_answer'
      }
    } else if (callStatus === 'no-answer') {
      updateData.call_outcome = 'no_answer'
    } else if (callStatus === 'busy') {
      updateData.call_outcome = 'busy'
    } else if (callStatus === 'failed') {
      updateData.call_outcome = 'failed'
    }

    const { error: updateError } = await supabaseAdmin
      .from('farmer_call_logs')
      .update(updateData)
      .eq('id', callLog.id)

    if (updateError) {
      console.error('Error updating call log:', updateError)
    }

    // Send follow-up SMS if call was completed and connected
    if (callStatus === 'completed' && updateData.call_outcome === 'connected' && !callLog.follow_up_sms_sent) {
      const farmer = (callLog as any).farmers_applications
      if (farmer && farmer.phone) {
        const smsResult = await sendSMS({
          to: farmer.phone,
          body: 'Thank you for speaking with Bornfidis. We will connect you to chefs and markets soon. 🇯🇲🌱',
        })

        if (smsResult.success && smsResult.messageSid) {
          await supabaseAdmin
            .from('farmer_call_logs')
            .update({
              follow_up_sms_sent: true,
              follow_up_sms_sid: smsResult.messageSid,
            })
            .eq('id', callLog.id)
        }
      }
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error in Twilio status callback:', error)
    // Always return 200 to Twilio to avoid retries
    return NextResponse.json({ success: false, error: error.message }, { status: 200 })
  }
}
