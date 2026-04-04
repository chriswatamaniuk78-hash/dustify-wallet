import type { Metadata } from 'next'
import ShellLayout from '@/components/shell/ShellLayout'
import DustTravelV2 from '@/components/travel/DustTravelV2'

export const metadata: Metadata = {
  title: 'Travel — Soul Wallet',
  description: 'Book flights, hotels, activities. No hidden fees. DustMiles on every booking.',
}

export default function TravelPage() {
  return (
    <ShellLayout>
      <DustTravelV2 />
    </ShellLayout>
  )
}
