import Link from 'next/link'
import { getEmailSendLogs, getFailedEmailCount } from '@/lib/email-send-log'
import { CulinaryCard, CulinaryPageHeader } from '@/components/culinary-os'

export const dynamic = 'force-dynamic'

export default async function AdminEmailLogPage() {
  const [logs, failedCount] = await Promise.all([
    getEmailSendLogs(200),
    getFailedEmailCount(7),
  ])

  return (
    <div className="space-y-6">
      <CulinaryPageHeader
        title="Email Log"
        description="Transactional email send attempts — sent, failed, and pending."
      />

      {failedCount > 0 && (
        <CulinaryCard className="border-red-300 bg-red-50/80">
          <p className="font-culinary-sans text-sm font-semibold text-red-900">
            {failedCount} failed email{failedCount === 1 ? '' : 's'} in the last 7 days
          </p>
          <p className="mt-1 font-culinary-sans text-xs text-red-800/80">
            Review errors below. Failed emails do not affect booking or payment state.
          </p>
        </CulinaryCard>
      )}

      <CulinaryCard padded={false} className="overflow-hidden">
        {logs.length === 0 ? (
          <div className="px-gutter py-8 text-center">
            <p className="font-culinary-sans text-sm text-culinary-text-muted">
              No email send logs yet. Logs appear after transactional emails are sent.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-culinary-outline bg-culinary-surface-low">
                  <th className="px-3 py-2 font-culinary-sans text-[10px] font-bold uppercase tracking-wider text-culinary-text-muted">Status</th>
                  <th className="px-3 py-2 font-culinary-sans text-[10px] font-bold uppercase tracking-wider text-culinary-text-muted">Division</th>
                  <th className="px-3 py-2 font-culinary-sans text-[10px] font-bold uppercase tracking-wider text-culinary-text-muted">Template</th>
                  <th className="px-3 py-2 font-culinary-sans text-[10px] font-bold uppercase tracking-wider text-culinary-text-muted">Recipient</th>
                  <th className="px-3 py-2 font-culinary-sans text-[10px] font-bold uppercase tracking-wider text-culinary-text-muted">Subject</th>
                  <th className="px-3 py-2 font-culinary-sans text-[10px] font-bold uppercase tracking-wider text-culinary-text-muted">Entity</th>
                  <th className="px-3 py-2 font-culinary-sans text-[10px] font-bold uppercase tracking-wider text-culinary-text-muted">Sent</th>
                  <th className="px-3 py-2 font-culinary-sans text-[10px] font-bold uppercase tracking-wider text-culinary-text-muted">Error</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-culinary-outline">
                {logs.map((log) => (
                  <tr key={log.id} className={log.status === 'failed' ? 'bg-red-50/50' : ''}>
                    <td className="whitespace-nowrap px-3 py-2">
                      <span
                        className={`inline-block rounded-none px-2 py-0.5 font-culinary-sans text-[10px] font-bold uppercase ${
                          log.status === 'sent'
                            ? 'bg-green-100 text-green-800'
                            : log.status === 'failed'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {log.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 font-culinary-sans text-xs text-culinary-text-muted">
                      {log.division}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 font-culinary-sans text-xs text-culinary-ink">
                      {log.templateType}
                    </td>
                    <td className="max-w-[160px] truncate px-3 py-2 font-culinary-sans text-xs text-culinary-ink">
                      {log.recipient}
                    </td>
                    <td className="max-w-[200px] truncate px-3 py-2 font-culinary-sans text-xs text-culinary-text-muted">
                      {log.subject}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 font-culinary-sans text-xs text-culinary-text-muted">
                      {log.bookingId ? (
                        <Link href={`/admin/bookings/${log.bookingId}`} className="underline">
                          Booking
                        </Link>
                      ) : log.projectId ? (
                        <Link href={`/admin/digital-studio/${log.projectId}`} className="underline">
                          Project
                        </Link>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 font-culinary-sans text-xs tabular-nums text-culinary-text-muted">
                      {log.sentAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}{' '}
                      {log.sentAt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="max-w-[200px] truncate px-3 py-2 font-culinary-sans text-xs text-red-700">
                      {log.errorMessage || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CulinaryCard>
    </div>
  )
}
