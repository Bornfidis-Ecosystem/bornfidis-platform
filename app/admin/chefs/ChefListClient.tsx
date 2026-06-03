'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Chef, ChefStatus } from '@/types/chef'

interface ChefListClientProps {
    chefs: Chef[]
}

export default function ChefListClient({ chefs }: ChefListClientProps) {
    const router = useRouter()
    const [processingId, setProcessingId] = useState<string | null>(null)
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

    const handleApprove = async (chefId: string) => {
        setProcessingId(chefId)
        setMessage(null)

        try {
            const response = await fetch(`/api/admin/chefs/${chefId}/approve`, {
                method: 'POST',
            })

            const data = await response.json()

            if (data.success) {
                setMessage({ type: 'success', text: 'Chef approved! Stripe onboarding link created.' })
                router.refresh()
            } else {
                // Display the error message from the server
                const errorText = data.error || 'Failed to approve chef'
                setMessage({ type: 'error', text: errorText })

                // If it's a Connect error, show additional help
                if (errorText.includes('Connect') || errorText.includes('connect')) {
                    console.error('Stripe Connect Error:', errorText)
                }
            }
        } catch (error: any) {
            console.error('Network error approving chef:', error)
            setMessage({ type: 'error', text: error.message || 'Network error. Please check your connection and try again.' })
        } finally {
            setProcessingId(null)
        }
    }

    const handleReject = async (chefId: string) => {
        const reason = prompt('Rejection reason (optional):')
        setProcessingId(chefId)
        setMessage(null)

        try {
            const response = await fetch(`/api/admin/chefs/${chefId}/reject`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ reason: reason || null }),
            })

            const data = await response.json()

            if (data.success) {
                setMessage({ type: 'success', text: 'Chef application rejected' })
                router.refresh()
            } else {
                setMessage({ type: 'error', text: data.error || 'Failed to reject chef' })
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'An error occurred' })
        } finally {
            setProcessingId(null)
        }
    }

    // Phase 5B: Get admin status badge (combines chef status + Connect status)
    const getAdminStatusBadge = (chef: Chef) => {
        // If rejected or inactive, show that
        if (chef.status === 'rejected') {
            return { text: 'Rejected', color: 'bg-red-100 text-red-800' }
        }
        if (chef.status === 'inactive') {
            return { text: 'Inactive', color: 'bg-gray-100 text-gray-800' }
        }

        // If pending, show Pending
        if (chef.status === 'pending') {
            return { text: 'Pending', color: 'bg-yellow-100 text-yellow-800' }
        }

        // If approved, check Connect status
        if (chef.status === 'approved') {
            if (chef.stripe_connect_status === 'connected') {
                return { text: 'Connected', color: 'bg-green-100 text-green-800' }
            }
            if (chef.stripe_connect_status === 'restricted') {
                return { text: 'Onboarding Required', color: 'bg-orange-100 text-orange-800' }
            }
            if (chef.stripe_connect_account_id) {
                return { text: 'Onboarding Required', color: 'bg-orange-100 text-orange-800' }
            }
            return { text: 'Approved', color: 'bg-blue-100 text-blue-800' }
        }

        // If active, show Connected
        if (chef.status === 'active') {
            return { text: 'Connected', color: 'bg-green-100 text-green-800' }
        }

        return { text: chef.status, color: 'bg-gray-100 text-gray-800' }
    }

    const getStatusBadgeColor = (status: ChefStatus) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800'
            case 'approved':
                return 'bg-blue-100 text-blue-800'
            case 'active':
                return 'bg-green-100 text-green-800'
            case 'rejected':
                return 'bg-red-100 text-red-800'
            case 'inactive':
                return 'bg-gray-100 text-gray-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        })
    }

    if (chefs.length === 0) {
        return (
            <div className="p-8 text-center text-gray-500">
                <p>No chefs found. Applications will appear here.</p>
            </div>
        )
    }

    return (
        <div>
            {message && (
                <div
                    className={`mx-6 mt-4 p-4 rounded-lg ${message.type === 'success'
                        ? 'bg-green-50 text-green-800 border border-green-200'
                        : 'bg-red-50 text-red-800 border border-red-200'
                        }`}
                >
                    <p className="font-semibold mb-1">{message.type === 'error' ? 'Error' : 'Success'}</p>
                    <p className="text-sm">{message.text}</p>
                    {message.type === 'error' && message.text.includes('Connect') && (
                        <div className="mt-3 pt-3 border-t border-red-300">
                            <p className="text-xs font-semibold mb-1">How to fix:</p>
                            <ol className="text-xs list-decimal list-inside space-y-1">
                                <li>Go to <a href="https://dashboard.stripe.com/connect" target="_blank" rel="noopener noreferrer" className="underline">Stripe Dashboard → Connect</a></li>
                                <li>Click "Get started" or "Activate Connect"</li>
                                <li>Choose "Express accounts"</li>
                                <li>Complete the setup process</li>
                                <li>Try approving the chef again</li>
                            </ol>
                        </div>
                    )}
                </div>
            )}

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Chef
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Applied
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Stripe
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {chefs.map((chef) => (
                            <tr key={chef.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div>
                                        <div className="text-sm font-medium text-gray-900">
                                            <Link href={`/admin/chefs/${chef.id}`} className="text-navy hover:underline">{chef.name}</Link>
                                        </div>
                                        <div className="text-sm text-gray-500">{chef.email}</div>
                                        <Link href={`/admin/chefs/${chef.id}`} className="text-xs text-navy hover:underline">Tier & override</Link>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {(() => {
                                        const badge = getAdminStatusBadge(chef)
                                        return (
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${badge.color}`}>
                                                {badge.text}
                                            </span>
                                        )
                                    })()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(chef.application_submitted_at).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {chef.stripe_onboarding_complete ? (
                                        <span className="text-green-600">✓ Complete</span>
                                    ) : chef.stripe_account_id ? (
                                        <span className="text-yellow-600">Onboarding</span>
                                    ) : (
                                        <span className="text-gray-400">—</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    {chef.status === 'pending' && (
                                        <div className="flex gap-2 justify-end">
                                            <button
                                                onClick={() => handleApprove(chef.id)}
                                                disabled={processingId === chef.id}
                                                className="px-3 py-1 bg-green-600 text-white rounded text-xs font-semibold hover:bg-green-700 transition disabled:opacity-50"
                                            >
                                                {processingId === chef.id ? 'Processing...' : 'Approve'}
                                            </button>
                                            <button
                                                onClick={() => handleReject(chef.id)}
                                                disabled={processingId === chef.id}
                                                className="px-3 py-1 bg-red-600 text-white rounded text-xs font-semibold hover:bg-red-700 transition disabled:opacity-50"
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    )}
                                    {chef.status === 'approved' && chef.stripe_connect_status !== 'connected' && (
                                        <button
                                            onClick={async () => {
                                                setProcessingId(chef.id)
                                                try {
                                                    // Create onboarding link and send email
                                                    const res = await fetch(`/api/stripe/connect/create-onboarding-link`, {
                                                        method: 'POST',
                                                        headers: { 'Content-Type': 'application/json' },
                                                        body: JSON.stringify({
                                                            chef_id: chef.id,
                                                            send_email: true,
                                                        }),
                                                    })
                                                    const data = await res.json()
                                                    if (data.success) {
                                                        window.open(data.onboarding_url, '_blank')
                                                        setMessage({
                                                            type: 'success',
                                                            text: `Onboarding link opened${data.email_sent ? ' and email sent to chef' : ''}`
                                                        })
                                                    } else {
                                                        setMessage({ type: 'error', text: data.error || 'Failed to create onboarding link' })
                                                    }
                                                } catch (error) {
                                                    setMessage({ type: 'error', text: 'An error occurred' })
                                                } finally {
                                                    setProcessingId(null)
                                                }
                                            }}
                                            disabled={processingId === chef.id}
                                            className="px-3 py-1 bg-blue-600 text-white rounded text-xs font-semibold hover:bg-blue-700 transition disabled:opacity-50"
                                        >
                                            {processingId === chef.id ? 'Loading...' : 'Send Onboarding Link'}
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

