'use client'

import { useEffect, useState } from 'react'

interface Message {
  id: string
  phone_number: string
  message_text: string
  farmer_name: string | null
  created_at: string
}

export default function WhatsAppAdmin() {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    console.log('📱 WhatsAppAdmin component mounted')
  }, [])

  useEffect(() => {
    async function loadMessages() {
      try {
        console.log('🔄 Fetching WhatsApp messages...')
        
        // Add timeout to prevent hanging
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout
        
        // Use API route to fetch messages (server-side with service role key)
        const response = await fetch('/api/admin/whatsapp-messages', {
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
          },
        })
        
        clearTimeout(timeoutId)
        
        console.log('📡 Response status:', response.status, response.statusText)
        
        if (!response.ok) {
          const errorText = await response.text()
          console.error('❌ Error response:', errorText)
          throw new Error(`Failed to load messages: ${response.status} ${response.statusText}`)
        }
        
        const result = await response.json()
        console.log('✅ Received data:', result)
        
        if (result.error) {
          console.error('❌ API returned error:', result.error)
          setError(result.error)
        } else {
          console.log(`✅ Loaded ${result.messages?.length || 0} messages`)
          setMessages(result.messages || [])
        }
        
      } catch (e: any) {
        console.error('❌ Error loading messages:', e)
        if (e.name === 'AbortError') {
          setError('Request timed out. Please check your connection and try again.')
        } else {
          setError(e.message || 'Failed to load messages. Please check the console for details.')
        }
      } finally {
        setLoading(false)
      }
    }
    
    loadMessages()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-4">WhatsApp Messages</h1>
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#1a5f3f]"></div>
            <p>Loading messages...</p>
          </div>
          <p className="text-sm text-gray-500 mt-2">If this takes too long, check the browser console for errors.</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-4">WhatsApp Messages</h1>
          <div className="bg-red-50 border border-red-200 rounded p-4">
            <p className="text-red-800 font-semibold">Error: {error}</p>
            <p className="text-sm text-red-600 mt-2">
              Make sure RLS policies allow reading from whatsapp_messages table.
              <br />
              Go to Supabase Dashboard → Table Editor → whatsapp_messages → Add RLS policy → Allow all
            </p>
            <button
              onClick={() => {
                setError(null)
                setLoading(true)
                window.location.reload()
              }}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">WhatsApp Messages</h1>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-[#1a5f3f] text-white rounded hover:bg-[#144a32]"
          >
            Refresh
          </button>
        </div>

        {messages.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500">No messages yet. Send a WhatsApp message to see it here!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className="bg-white rounded-lg shadow p-6 border-l-4 border-[#1a5f3f]"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-semibold text-gray-900">
                      {msg.phone_number}
                    </p>
                    {msg.farmer_name && (
                      <p className="text-sm text-gray-600">Farmer: {msg.farmer_name}</p>
                    )}
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(msg.created_at).toLocaleString()}
                  </span>
                </div>
                <p className="text-gray-700 mt-2">{msg.message_text}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

