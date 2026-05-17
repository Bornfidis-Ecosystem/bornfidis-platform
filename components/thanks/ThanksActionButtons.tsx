import { PrimaryButton } from '@/components/ui/PrimaryButton'
import { SecondaryButton } from '@/components/ui/SecondaryButton'

export function ThanksActionButtons() {
  return (
    <div className="flex flex-col items-center gap-3 sm:flex-row sm:flex-wrap sm:justify-center">
      <PrimaryButton theme="culinary" href="/">
        Return home
      </PrimaryButton>
      <SecondaryButton theme="culinary" href="/menu">
        View sample menus
      </SecondaryButton>
      <SecondaryButton theme="culinary" href="/story">
        Our story
      </SecondaryButton>
    </div>
  )
}
