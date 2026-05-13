import { StatusBadge } from './StatusBadge'

type PaidState = 'paid' | 'pending' | 'n/a'

export function PaymentBadge({ label, state }: { label: string; state: PaidState }) {
  const tone = state === 'paid' ? 'success' : state === 'pending' ? 'warning' : 'neutral'
  return (
    <StatusBadge tone={tone}>
      {label}: {state === 'paid' ? 'Paid' : state === 'pending' ? 'Pending' : 'N/A'}
    </StatusBadge>
  )
}
