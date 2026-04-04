import type { Metadata } from 'next'
import ShellLayout from '@/components/shell/ShellLayout'
import DustMilesRewards from '@/components/settings/DustMilesRewards'

export const metadata: Metadata = {
  title: 'DustMiles Rewards — Soul Wallet',
  description: '100 DM = 1 USDC. Fixed forever. The world\'s most generous, self-sustaining rewards waterfall.',
}

export default function MilesPage() {
  return (
    <ShellLayout>
      <DustMilesRewards />
    </ShellLayout>
  )
}
