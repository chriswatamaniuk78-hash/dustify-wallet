import type { Metadata } from 'next'
import ShellLayout from '@/components/shell/ShellLayout'
import RedeemFlow from '@/components/redeem/RedeemFlow'

export const metadata: Metadata = { title: 'Redeem Points' }

export default function RedeemPage() {
  return (
    <ShellLayout>
      <RedeemFlow />
    </ShellLayout>
  )
}
