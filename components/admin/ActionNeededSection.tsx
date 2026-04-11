'use client'

import Link from 'next/link'
import toast from 'react-hot-toast'
import type { AdminActionNeeded, ActionNeededItem } from '@/lib/admin-action-needed'
import { buildReminderText, type ReminderType } from '@/lib/reminders/buildReminderText'

type GroupConfig = {
  label: string
  type: ReminderType
  items: ActionNeededItem[]
  /** Deep-link to filtered /admin/bookings queue */
  queueHref: string
}

function buildWhatsAppUrl(message: string) {
  return `https://wa.me/18027335348?text=${encodeURIComponent(message)}`
}

async function copyText(text: string) {
  await navigator.clipboard.writeText(text)
}

export default function ActionNeededSection({ actionNeeded }: { actionNeeded: AdminActionNeeded | null }) {
  const groups: GroupConfig[] = [
    {
      label: 'Deposit Follow-Up',
      type: 'deposit',
      items: actionNeeded?.depositFollowUps ?? [],
      queueHref: '/admin/bookings?deposit=pending',
    },
    {
      label: 'Upcoming Prep',
      type: 'prep',
      items: actionNeeded?.upcomingPrep ?? [],
      queueHref: '/admin/bookings?status=confirmed&upcoming=3',
    },
    {
      label: 'Final Balance Reminder',
      type: 'final_balance',
      items: actionNeeded?.finalBalanceReminders ?? [],
      queueHref: '/admin/bookings?balance=pending',
    },
    {
      label: 'Post-Event Follow-Up',
      type: 'testimonial',
      items: actionNeeded?.postEventFollowUps ?? [],
      queueHref: '/admin/bookings?testimonial=needed',
    },
  ]

  const handleCopy = async (channel: 'whatsapp' | 'email', item: ActionNeededItem, type: ReminderType) => {
    try {
      const built = buildReminderText({
        type,
        name: item.name,
        eventDate: item.eventDate,
      })
      const output = channel === 'whatsapp' ? built.whatsapp : built.email
      await copyText(output)
      const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      toast.success(`Copied ${channel} message (${time})`)
    } catch {
      toast.error(`Could not copy ${channel} message`)
    }
  }

  return (
    <section className="min-w-0">
      <h2 className="text-xs font-semibold text-stone-500 uppercase tracking-[0.2em] mb-5 pb-2 border-b border-stone-200">
        Action Needed
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {groups.map((group) => (
          <div key={group.label} className="rounded-xl border border-stone-200/80 bg-white p-4">
            <h3 className="text-sm font-semibold text-navy mb-3">{group.label}</h3>
            {group.items.length === 0 ? (
              <p className="text-sm text-stone-500">No actions right now</p>
            ) : (
              <div className="space-y-2">
                {group.items.map((item) => (
                  <div key={item.id} className="rounded-lg border border-stone-200 px-3 py-2">
                    <p className="text-sm font-semibold text-stone-900 truncate">{item.name}</p>
                    <p className="text-xs text-stone-600">
                      {new Date(item.eventDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} · {item.status}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <Link href={`/admin/bookings/${item.id}`} className="text-xs font-semibold text-navy underline">
                        Open
                      </Link>
                      <a
                        href={buildWhatsAppUrl(
                          buildReminderText({
                            type: group.type,
                            name: item.name,
                            eventDate: item.eventDate,
                          }).whatsapp
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition"
                      >
                        WhatsApp
                      </a>
                      <button
                        type="button"
                        onClick={() => handleCopy('email', item, group.type)}
                        className="text-xs px-2 py-1 border border-stone-300 rounded text-stone-700 hover:bg-stone-50 transition"
                      >
                        Email
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <Link
              href={group.queueHref}
              className="mt-3 inline-flex text-xs font-semibold text-navy hover:underline"
            >
              View full queue →
            </Link>
          </div>
        ))}
      </div>
    </section>
  )
}

