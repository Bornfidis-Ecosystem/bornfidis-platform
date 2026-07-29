'use client'

import { useMemo, useState } from 'react'
import { CulinaryCard } from '@/components/culinary-os'
import {
  createAdminInvoice,
  type CreateAdminInvoiceResult,
} from '../actions'
import type { AdminInvoicePrefill } from '@/lib/admin-invoices'

type LineItem = {
  description: string
  unitAmount: string
  quantity: string
}

const emptyLine = (): LineItem => ({
  description: '',
  unitAmount: '',
  quantity: '1',
})

type Props = {
  initialPrefill?: AdminInvoicePrefill | null
}

export default function NewInvoiceForm({ initialPrefill }: Props) {
  const [division, setDivision] = useState<'provisions' | 'digital-studio' | ''>(
    initialPrefill?.division || ''
  )
  const [clientName, setClientName] = useState(initialPrefill?.clientName || '')
  const [clientEmail, setClientEmail] = useState(initialPrefill?.clientEmail || '')
  const [bookingId, setBookingId] = useState(initialPrefill?.bookingId || '')
  const [projectId, setProjectId] = useState(initialPrefill?.projectId || '')
  const [lineItems, setLineItems] = useState<LineItem[]>(
    initialPrefill?.lineItems?.length
      ? initialPrefill.lineItems.map((item) => ({
          description: item.description,
          unitAmount: item.unitAmount ? String(item.unitAmount) : '',
          quantity: String(item.quantity),
        }))
      : [emptyLine()]
  )
  const [depositReceived, setDepositReceived] = useState(
    initialPrefill?.depositReceived ? String(initialPrefill.depositReceived) : ''
  )
  const [depositDate, setDepositDate] = useState(initialPrefill?.depositDate || '')
  const [dueDate, setDueDate] = useState(initialPrefill?.dueDate || '')
  const [footerNote, setFooterNote] = useState('Small batch. No shortcuts.')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<Extract<CreateAdminInvoiceResult, { success: true }> | null>(
    null,
  )
  const [copied, setCopied] = useState(false)

  const depositNum = parseFloat(depositReceived) || 0

  const derivedTotal = useMemo(() => {
    const gross = lineItems.reduce((sum, item) => {
      const unit = parseFloat(item.unitAmount) || 0
      const qty = parseFloat(item.quantity) || 0
      return sum + unit * qty
    }, 0)
    const due = Math.max(gross - (depositNum > 0 ? depositNum : 0), 0)
    return { gross, due }
  }, [lineItems, depositNum])

  const updateLine = (index: number, patch: Partial<LineItem>) => {
    setLineItems((rows) => rows.map((row, i) => (i === index ? { ...row, ...patch } : row)))
  }

  const addLine = () => setLineItems((rows) => [...rows, emptyLine()])

  const removeLine = (index: number) => {
    setLineItems((rows) => (rows.length <= 1 ? rows : rows.filter((_, i) => i !== index)))
  }

  const handleCopy = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setError('Could not copy URL — select and copy manually.')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setResult(null)
    setSaving(true)

    const parsedLines = lineItems.map((item) => ({
      description: item.description.trim(),
      unitAmount: parseFloat(item.unitAmount),
      quantity: parseFloat(item.quantity) || 1,
    }))

    if (!division) {
      setError('Select an explicit Stripe division before creating the invoice.')
      setSaving(false)
      return
    }

    const res = await createAdminInvoice({
      division,
      clientName: clientName.trim(),
      clientEmail: clientEmail.trim(),
      bookingId: bookingId.trim() || undefined,
      projectId: projectId.trim() || initialPrefill?.projectId,
      clientId: initialPrefill?.clientId || undefined,
      sourceType: initialPrefill?.sourceType,
      sourceId: initialPrefill?.sourceId,
      lineItems: parsedLines,
      depositReceived: depositNum > 0 ? depositNum : undefined,
      depositDate: depositNum > 0 && depositDate ? depositDate : undefined,
      dueDate,
      footerNote: footerNote.trim() || undefined,
    })

    setSaving(false)
    if (!res.success) {
      setError(res.error)
      return
    }
    setResult(res)
  }

  const inputClass =
    'mt-0.5 w-full rounded-none border border-culinary-outline bg-white px-3 py-2 font-culinary-sans text-sm text-culinary-ink'
  const labelClass =
    'font-culinary-sans text-[10px] font-bold uppercase tracking-wider text-culinary-text-muted'

  return (
    <div className="space-y-6">
      <CulinaryCard>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass} htmlFor="division">
                Stripe division (required)
              </label>
              <select
                id="division"
                value={division}
                onChange={(e) =>
                  setDivision(e.target.value as 'provisions' | 'digital-studio' | '')
                }
                className={inputClass}
                required
                disabled={Boolean(initialPrefill?.divisionLocked)}
              >
                <option value="" disabled>
                  Select division…
                </option>
                <option value="provisions">Provisions</option>
                <option value="digital-studio">Digital Studio</option>
              </select>
              <p className="mt-1 font-culinary-sans text-xs text-culinary-text-muted">
                Selected: {division || 'none'} — Academy is not available.
              </p>
            </div>
            <div>
              <label className={labelClass} htmlFor="bookingId">
                Booking ID (optional)
              </label>
              <input
                id="bookingId"
                type="text"
                value={bookingId}
                onChange={(e) => setBookingId(e.target.value)}
                placeholder="Provisions booking id"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="projectId">
                Project ID (optional)
              </label>
              <input
                id="projectId"
                type="text"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                placeholder="Digital Studio project id"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="clientName">
                Client name
              </label>
              <input
                id="clientName"
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className={inputClass}
                required
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="clientEmail">
                Client email
              </label>
              <input
                id="clientEmail"
                type="email"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                className={inputClass}
                required
              />
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className={labelClass}>Line items</p>
              <p className="font-culinary-sans text-xs text-culinary-text-muted">
                Gross ${derivedTotal.gross.toFixed(2)}
                {depositNum > 0 ? ` → Due $${derivedTotal.due.toFixed(2)}` : ''}
              </p>
            </div>
            <p className="mb-3 font-culinary-sans text-xs text-culinary-text-muted">
              Enter charge amounts. If a deposit was already received, it is noted on the invoice and
              subtracted from the amount due (never as a negative line).
            </p>
            <div className="space-y-3">
              {lineItems.map((item, index) => (
                <div
                  key={index}
                  className="grid grid-cols-1 gap-2 border border-culinary-outline p-3 sm:grid-cols-12"
                >
                  <div className="sm:col-span-6">
                    <label className={labelClass}>Description</label>
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => updateLine(index, { description: e.target.value })}
                      className={inputClass}
                      required
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <label className={labelClass}>Unit amount ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={item.unitAmount}
                      onChange={(e) => updateLine(index, { unitAmount: e.target.value })}
                      className={inputClass}
                      required
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelClass}>Qty</label>
                    <input
                      type="number"
                      step="1"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateLine(index, { quantity: e.target.value })}
                      className={inputClass}
                      required
                    />
                  </div>
                  <div className="flex items-end sm:col-span-1">
                    <button
                      type="button"
                      onClick={() => removeLine(index)}
                      disabled={lineItems.length <= 1}
                      className="w-full rounded-none border border-culinary-outline px-2 py-2 font-culinary-sans text-xs text-culinary-text-muted disabled:opacity-40"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addLine}
              className="mt-3 rounded-none border border-culinary-outline px-3 py-2 font-culinary-sans text-xs font-semibold text-culinary-navy transition hover:border-culinary-gold-line"
            >
              + Add line item
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className={labelClass} htmlFor="depositReceived">
                Deposit received ($)
              </label>
              <input
                id="depositReceived"
                type="number"
                step="0.01"
                min="0"
                value={depositReceived}
                onChange={(e) => setDepositReceived(e.target.value)}
                placeholder="Optional"
                className={inputClass}
              />
            </div>
            {depositNum > 0 && (
              <div>
                <label className={labelClass} htmlFor="depositDate">
                  Deposit date
                </label>
                <input
                  id="depositDate"
                  type="date"
                  value={depositDate}
                  onChange={(e) => setDepositDate(e.target.value)}
                  className={inputClass}
                />
              </div>
            )}
            <div>
              <label className={labelClass} htmlFor="dueDate">
                Due date
              </label>
              <input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className={inputClass}
                required
              />
            </div>
          </div>

          <div>
            <label className={labelClass} htmlFor="footerNote">
              Footer
            </label>
            <input
              id="footerNote"
              type="text"
              value={footerNote}
              onChange={(e) => setFooterNote(e.target.value)}
              className={inputClass}
            />
          </div>

          {error && (
            <div className="border border-red-300 bg-red-50 px-3 py-2">
              <p className="font-culinary-sans text-sm text-red-800">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="rounded-none bg-culinary-forest px-5 py-2.5 font-culinary-sans text-sm font-semibold text-white transition hover:bg-culinary-forest/90 disabled:opacity-50"
          >
            {saving ? 'Creating invoice…' : 'Create & send invoice'}
          </button>
        </form>
      </CulinaryCard>

      {result && (
        <CulinaryCard className="border-green-300 bg-green-50/50">
          <p className="font-culinary-sans text-sm font-semibold text-green-900">
            Invoice created
          </p>
          <dl className="mt-3 space-y-2 font-culinary-sans text-sm text-culinary-ink">
            <div className="flex flex-wrap gap-2">
              <dt className="text-culinary-text-muted">Invoice ID</dt>
              <dd className="font-mono text-xs">{result.invoiceId}</dd>
            </div>
            <div className="flex flex-wrap gap-2">
              <dt className="text-culinary-text-muted">Amount due</dt>
              <dd className="font-semibold tabular-nums">
                ${(result.amountDue / 100).toFixed(2)}
              </dd>
            </div>
            <div className="flex flex-wrap gap-2">
              <dt className="text-culinary-text-muted">Email</dt>
              <dd>
                {result.customerEmail}
                {result.emailSent ? ' (sent)' : ' (send failed — share URL manually)'}
              </dd>
            </div>
            <div className="flex flex-wrap gap-2">
              <dt className="text-culinary-text-muted">Stripe account</dt>
              <dd className="font-mono text-xs">{result.stripeAccountId}</dd>
            </div>
            <div className="flex flex-wrap gap-2">
              <dt className="text-culinary-text-muted">Local record</dt>
              <dd className="font-mono text-xs">{result.localInvoiceId}</dd>
            </div>
            <div className="pt-2">
              <a
                href={`/admin/invoices/${result.localInvoiceId}`}
                className="font-culinary-sans text-sm font-semibold text-culinary-navy hover:underline"
              >
                Open invoice detail →
              </a>
            </div>
            {result.hostedInvoiceUrl && (
              <div className="space-y-2 pt-2">
                <dt className="text-culinary-text-muted">Hosted invoice URL</dt>
                <dd className="break-all font-mono text-xs text-culinary-navy">
                  {result.hostedInvoiceUrl}
                </dd>
                <button
                  type="button"
                  onClick={() => handleCopy(result.hostedInvoiceUrl!)}
                  className="rounded-none border border-culinary-outline bg-white px-3 py-1.5 font-culinary-sans text-xs font-semibold text-culinary-navy"
                >
                  {copied ? 'Copied' : 'Copy URL'}
                </button>
              </div>
            )}
          </dl>
        </CulinaryCard>
      )}
    </div>
  )
}
