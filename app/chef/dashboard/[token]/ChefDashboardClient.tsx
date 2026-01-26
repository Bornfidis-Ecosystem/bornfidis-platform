'use client'

import { useState } from 'react'
import { formatUSD } from '@/lib/money'
import Link from 'next/link'

interface ChefDashboardData {
  chef: {
    id: string
    name: string
    email: string
    stripe_connect_status: string
    payouts_enabled: boolean
    stripe_onboarded_at?: string
    payout_percentage: number
  }
  earnings: {
    total_paid_cents: number
    pending_cents: number
    upcoming_cents: number
  }
  bookings: {
    upcoming: Array<{
      id: string
      name: string
      event_date: string
      location: string
      guests?: number
      quote_total_cents: number
      payout_amount_cents: number
      status: string
    }>
    completed: Array<{
      id: string
      name: string
      event_date: string
      location: string
      quote_total_cents: number
      payout_amount_cents: number
      paid_at?: string
      status: string
    }>
  }
}

interface ChefDashboardClientProps {
  dashboardData: ChefDashboardData
  chefId: string
}

export default function ChefDashboardClient({ dashboardData, chefId }: ChefDashboardClientProps) {
  const getConnectStatusBadge = () => {
    switch (dashboardData.chef.stripe_connect_status) {
      case 'connected':
        return (
          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
            ✓ Connected
          </span>
        )
      case 'pending':
        return (
          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold">
            ⏳ Pending
          </span>
        )
      case 'restricted':
        return (
          <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-semibold">
            ⚠️ Restricted
          </span>
        )
      default:
        return (
          <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-semibold">
            Not Connected
          </span>
        )
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-semibold">Paid</span>
      case 'completed':
        return <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-semibold">Completed</span>
      case 'assigned':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-semibold">Assigned</span>
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs font-semibold">{status}</span>
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-[#1a5f3f] text-white py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <h1 className="text-3xl font-bold mb-2">Chef Dashboard</h1>
          <div className="h-1 w-24 bg-[#FFBC00] mb-4"></div>
          <p className="text-green-100 text-sm">Welcome, {dashboardData.chef.name}</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Stripe Connect Status */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-[#1a5f3f] mb-4 pb-2 border-b border-[#FFBC00]">
            Stripe Account Status
          </h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Connection Status</p>
              {getConnectStatusBadge()}
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600 mb-1">Payouts Enabled</p>
              <span className={`font-semibold ${dashboardData.chef.payouts_enabled ? 'text-green-600' : 'text-gray-400'}`}>
                {dashboardData.chef.payouts_enabled ? 'Yes ✓' : 'No'}
              </span>
            </div>
          </div>
        </div>

        {/* Earnings Summary */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-[#1a5f3f] mb-4 pb-2 border-b border-[#FFBC00]">
            Earnings Summary
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <p className="text-sm text-gray-600 mb-1">Total Paid Out</p>
              <p className="text-2xl font-bold text-[#1a5f3f]">
                {formatUSD(dashboardData.earnings.total_paid_cents)}
              </p>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
              <p className="text-sm text-gray-600 mb-1">Pending Payouts</p>
              <p className="text-2xl font-bold text-yellow-700">
                {formatUSD(dashboardData.earnings.pending_cents)}
              </p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <p className="text-sm text-gray-600 mb-1">Upcoming Bookings</p>
              <p className="text-2xl font-bold text-blue-700">
                {formatUSD(dashboardData.earnings.upcoming_cents)}
              </p>
            </div>
          </div>
        </div>

        {/* Upcoming Bookings */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-[#1a5f3f] mb-4 pb-2 border-b border-[#FFBC00]">
            Upcoming Bookings
          </h2>
          {dashboardData.bookings.upcoming.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No upcoming bookings.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 text-gray-600 font-semibold">Event</th>
                    <th className="text-left py-2 text-gray-600 font-semibold">Date</th>
                    <th className="text-right py-2 text-gray-600 font-semibold">Total</th>
                    <th className="text-right py-2 text-gray-600 font-semibold">Your Payout</th>
                    <th className="text-right py-2 text-gray-600 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData.bookings.upcoming.map((booking) => (
                    <tr key={booking.id} className="border-b border-gray-100">
                      <td className="py-3">
                        <div className="font-medium text-gray-900">{booking.name}</div>
                        <div className="text-xs text-gray-500">{booking.location}</div>
                        {booking.guests && (
                          <div className="text-xs text-gray-500">{booking.guests} guests</div>
                        )}
                      </td>
                      <td className="py-3 text-gray-700">
                        {new Date(booking.event_date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-3 text-right font-medium">
                        {formatUSD(booking.quote_total_cents)}
                      </td>
                      <td className="py-3 text-right">
                        <span className="font-semibold text-[#1a5f3f]">
                          {formatUSD(booking.payout_amount_cents)}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        {getStatusBadge(booking.status)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Completed Bookings */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-[#1a5f3f] mb-4 pb-2 border-b border-[#FFBC00]">
            Completed Bookings
          </h2>
          {dashboardData.bookings.completed.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No completed bookings yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 text-gray-600 font-semibold">Event</th>
                    <th className="text-left py-2 text-gray-600 font-semibold">Date</th>
                    <th className="text-right py-2 text-gray-600 font-semibold">Total</th>
                    <th className="text-right py-2 text-gray-600 font-semibold">Your Payout</th>
                    <th className="text-right py-2 text-gray-600 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData.bookings.completed.map((booking) => (
                    <tr key={booking.id} className="border-b border-gray-100">
                      <td className="py-3">
                        <div className="font-medium text-gray-900">{booking.name}</div>
                        <div className="text-xs text-gray-500">{booking.location}</div>
                      </td>
                      <td className="py-3 text-gray-700">
                        {new Date(booking.event_date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-3 text-right font-medium">
                        {formatUSD(booking.quote_total_cents)}
                      </td>
                      <td className="py-3 text-right">
                        <span className={`font-semibold ${booking.status === 'paid' ? 'text-green-600' : 'text-[#1a5f3f]'}`}>
                          {formatUSD(booking.payout_amount_cents)}
                        </span>
                        {booking.paid_at && (
                          <div className="text-xs text-gray-500 mt-1">
                            Paid {new Date(booking.paid_at).toLocaleDateString()}
                          </div>
                        )}
                      </td>
                      <td className="py-3 text-right">
                        {getStatusBadge(booking.status)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p className="italic">
            "Whatever you do, work at it with all your heart, as working for the Lord, not for human masters."
          </p>
          <p className="mt-2 font-semibold">— Colossians 3:23</p>
        </div>
      </main>
    </div>
  )
}
