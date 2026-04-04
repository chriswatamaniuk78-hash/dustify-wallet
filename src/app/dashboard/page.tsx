import type { Metadata } from 'next'
import ShellLayout from '@/components/shell/ShellLayout'
import DashboardEnhanced from '@/components/dashboard/DashboardEnhanced'

export const metadata: Metadata = { title: 'Dashboard — Soul Wallet' }

export default function DashboardPage() {
  return (
    <ShellLayout>
      <DashboardEnhanced />
    </ShellLayout>
  )
}
