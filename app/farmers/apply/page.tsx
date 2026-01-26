import FarmerIntakeForm from '@/components/farmers/FarmerIntakeForm'

export const metadata = {
  title: 'Become a Bornfidis Farmer | ProJu Marketplace',
}

export default function FarmerApplyPage() {
  return (
    <div className="min-h-screen bg-white">
      <FarmerIntakeForm />
    </div>
  )
}
