'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { CulinaryCard } from '@/components/culinary-os'
import { updateApplicationStatus, convertToProject } from '../../actions'

type Props = {
  application: {
    id: string
    status: string
    businessName: string
    contactName: string
    contactEmail: string
  }
  existingProjects: { id: string; projectNumber: string; status: string }[]
}

const STATUS_OPTIONS = [
  'new',
  'reviewing',
  'consultation',
  'proposal',
  'accepted',
  'declined',
  'in_progress',
  'completed',
]

export default function ApplicationDetailClient({ application, existingProjects }: Props) {
  const router = useRouter()
  const [status, setStatus] = useState(application.status)
  const [saving, setSaving] = useState(false)
  const [converting, setConverting] = useState(false)
  const [showConvert, setShowConvert] = useState(false)
  const [totalCents, setTotalCents] = useState('')
  const [depositCents, setDepositCents] = useState('')
  const [targetDate, setTargetDate] = useState('')

  const handleStatusChange = async (newStatus: string) => {
    setSaving(true)
    const result = await updateApplicationStatus(application.id, newStatus)
    if (result.success) {
      setStatus(newStatus)
      router.refresh()
    }
    setSaving(false)
  }

  const handleConvert = async () => {
    setConverting(true)
    const result = await convertToProject(application.id, {
      totalAmountCents: totalCents ? Math.round(parseFloat(totalCents) * 100) : undefined,
      depositAmountCents: depositCents ? Math.round(parseFloat(depositCents) * 100) : undefined,
      targetLaunchDate: targetDate || undefined,
    })
    if (result.success && result.projectId) {
      router.push(`/admin/digital-studio/${result.projectId}`)
    }
    setConverting(false)
  }

  return (
    <div className="space-y-4">
      <CulinaryCard>
        <p className="font-culinary-sans text-[10px] font-bold uppercase tracking-wider text-culinary-text-muted">
          Status
        </p>
        <select
          value={status}
          onChange={(e) => handleStatusChange(e.target.value)}
          disabled={saving}
          className="mt-1 w-full rounded-none border border-culinary-outline bg-white px-3 py-2 font-culinary-sans text-sm text-culinary-ink"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </CulinaryCard>

      {existingProjects.length > 0 && (
        <CulinaryCard>
          <p className="font-culinary-sans text-[10px] font-bold uppercase tracking-wider text-culinary-text-muted">
            Linked Projects
          </p>
          <div className="mt-2 space-y-1">
            {existingProjects.map((p) => (
              <Link
                key={p.id}
                href={`/admin/digital-studio/${p.id}`}
                className="block font-culinary-sans text-sm text-culinary-navy underline"
              >
                {p.projectNumber} ({p.status})
              </Link>
            ))}
          </div>
        </CulinaryCard>
      )}

      {existingProjects.length === 0 && (
        <CulinaryCard>
          <p className="font-culinary-sans text-[10px] font-bold uppercase tracking-wider text-culinary-text-muted">
            Create Project
          </p>
          {!showConvert ? (
            <button
              type="button"
              onClick={() => setShowConvert(true)}
              className="mt-2 w-full rounded-none border border-culinary-outline bg-culinary-forest px-4 py-2 font-culinary-sans text-sm font-semibold text-white transition hover:bg-culinary-forest/90"
            >
              Convert to Project
            </button>
          ) : (
            <div className="mt-2 space-y-3">
              <div>
                <label className="font-culinary-sans text-xs text-culinary-text-muted">Total ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={totalCents}
                  onChange={(e) => setTotalCents(e.target.value)}
                  placeholder="e.g. 5000"
                  className="mt-0.5 w-full rounded-none border border-culinary-outline px-3 py-1.5 font-culinary-sans text-sm"
                />
              </div>
              <div>
                <label className="font-culinary-sans text-xs text-culinary-text-muted">Deposit ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={depositCents}
                  onChange={(e) => setDepositCents(e.target.value)}
                  placeholder="e.g. 2500"
                  className="mt-0.5 w-full rounded-none border border-culinary-outline px-3 py-1.5 font-culinary-sans text-sm"
                />
              </div>
              <div>
                <label className="font-culinary-sans text-xs text-culinary-text-muted">Target launch</label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="mt-0.5 w-full rounded-none border border-culinary-outline px-3 py-1.5 font-culinary-sans text-sm"
                />
              </div>
              <button
                type="button"
                onClick={handleConvert}
                disabled={converting}
                className="w-full rounded-none bg-culinary-forest px-4 py-2 font-culinary-sans text-sm font-semibold text-white transition hover:bg-culinary-forest/90 disabled:opacity-50"
              >
                {converting ? 'Creating...' : 'Create Project + Tasks'}
              </button>
            </div>
          )}
        </CulinaryCard>
      )}
    </div>
  )
}
