import { notFound } from 'next/navigation'
import PortalClient from './PortalClient'

interface PortalData {
  booking_id: string
  customer_name: string
  customer_email?: string
  customer_phone?: string
  event_date: string
  event_time?: string
  location: string
  guests?: number
  status: string
  quote: {
    subtotal_cents: number
    tax_cents: number
    service_fee_cents: number
    total_cents: number
    notes?: string
    line_items: any[]
  }
  deposit: {
    percentage: number
    amount_cents: number
    paid: boolean
    paid_at?: string
  }
  balance: {
    amount_cents: number
    paid: boolean
    paid_at?: string
  }
  fully_paid: boolean
  fully_paid_at?: string
  invoice_available: boolean
  chef?: { id: string; name: string } | null
}

async function getPortalData(token: string): Promise<PortalData | null> {
  try {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const response = await fetch(`${siteUrl}/api/portal/${token}`, {
      cache: 'no-store',
    })

    if (!response.ok) {
      return null
    }

    const result = await response.json()
    return result.success ? result.data : null
  } catch (error) {
    console.error('Error fetching portal data:', error)
    return null
  }
}

export default async function PortalPage({ params }: { params: { token: string } }) {
  const portalData = await getPortalData(params.token)

  if (!portalData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Link Expired</h1>
          <p className="text-gray-600 mb-6">
            This link has expired or is no longer valid. Please contact us for assistance.
          </p>
          <a
            href="mailto:brian@bornfidis.com"
            className="inline-block px-6 py-3 bg-[#1a5f3f] text-white rounded-lg font-semibold hover:bg-[#154a32] transition"
          >
            Contact Us
          </a>
        </div>
      </div>
    )
  }

  return <PortalClient portalData={portalData} token={params.token} />
}

