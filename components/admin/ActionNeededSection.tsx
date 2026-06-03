'use client'

import Link from 'next/link'
import toast from 'react-hot-toast'
import type { AdminActionNeeded, ActionNeededItem } from '@/lib/admin-action-needed'
import { buildReminderText, type ReminderType } from '@/lib/reminders/buildReminderText'
import { CulinaryCard } from '@/components/culinary-os'

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

const sectionHeading =
  'mb-5 border-b border-culinary-outline pb-2 font-culinary-sans text-label-caps uppercase tracking-[0.1em] text-culinary-text-muted'

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
      <h2 className={sectionHeading}>Action Needed</h2>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {groups.map((group) => (
          <CulinaryCard key={group.label}>
            <h3 className="mb-3 font-culinary-sans text-sm font-semibold text-culinary-navy">{group.label}</h3>
            {group.items.length === 0 ? (
              <p className="font-culinary-sans text-sm text-culinary-text-muted">No actions right now</p>
            ) : (
              <div className="space-y-2">
                {group.items.map((item) => (
                  <div key={item.id} className="rounded-none border border-culinary-outline px-3 py-2">
                    <p className="truncate font-culinary-sans text-sm font-semibold text-culinary-ink">{item.name}</p>
                    <p className="font-culinary-sans text-xs text-culinary-text-muted">
                      {new Date(item.eventDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} ·{' '}
                      {item.status}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <Link href={`/admin/bookings/${item.id}`} className="font-culinary-sans text-xs font-semibold text-culinary-navy underline">
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
                        className="rounded-none bg-culinary-forest px-2 py-1 font-culinary-sans text-xs text-white transition refined hover:bg-culinary-forest/90"
                      >
                        WhatsApp
                      </a>
                      <button
                        type="button"
                        onClick={() => handleCopy('email', item, group.type)}
                        className="rounded-none border border-culinary-outline px-2 py-1 font-culinary-sans text-xs text-culinary-ink transition refined hover:border-culinary-gold-line hover:bg-culinary-surface-low"
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
              className="mt-3 inline-flex font-culinary-sans text-xs font-semibold text-culinary-navy underline decoration-culinary-gold-line underline-offset-2 hover:text-culinary-text-muted"
            >
              View full queue →
            </Link>
          </CulinaryCard>
        ))}
      </div>
    </section>
  )
}
