import type { Metadata } from 'next'
import ShellLayout from '@/components/shell/ShellLayout'
import { SettingsPage as SettingsAndMilesPage } from '@/components/settings/SettingsAndMiles'

export const metadata: Metadata = {
  title: 'Fee Structure & Revenue — Soul Wallet',
  description: 'Dustify fee comparison and revenue projections. Lowest fees in every category.',
}

export default function SettingsPage() {
  return (
    <ShellLayout>
      <SettingsAndMilesPage />
    </ShellLayout>
  )
}
