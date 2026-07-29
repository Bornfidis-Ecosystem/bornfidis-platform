import { CulinaryPageHeader } from '@/components/culinary-os'
import { requireAdminUser } from '@/lib/requireAdmin'
import { getAdminInvoicePrefillAction } from '../actions'
import NewInvoiceForm from './NewInvoiceForm'

export const dynamic = 'force-dynamic'

/**
 * Admin invoice builder — Provisions or Digital Studio Stripe account.
 */
export default async function AdminNewInvoicePage({
  searchParams,
}: {
  searchParams?: Promise<{ sourceType?: string; sourceId?: string }>
}) {
  await requireAdminUser()
  const params = (await searchParams) || {}
  const sourceType = params.sourceType
  const sourceId = params.sourceId
  const initialPrefill =
    sourceType &&
    sourceId &&
    (sourceType === 'booking' ||
      sourceType === 'quote' ||
      sourceType === 'project' ||
      sourceType === 'proposal')
      ? await getAdminInvoicePrefillAction({ sourceType, sourceId })
      : null

  return (
    <div className="space-y-6">
      <CulinaryPageHeader
        title="New Invoice"
        description="Create a Stripe invoice on the Provisions or Digital Studio account. Deposits are noted and subtracted — never sent as negative line items. Academy is not available."
      />
      <NewInvoiceForm initialPrefill={initialPrefill} />
    </div>
  )
}