import type { Metadata } from 'next'
import ShellLayout from '@/components/shell/ShellLayout'
import DustGamingUltimate from '@/components/gaming/DustGamingUltimate'

export const metadata: Metadata = {
  title: 'Gaming — Soul Wallet',
  description: 'Play to win. Real USDC prizes. SBT anti-cheat. Instant withdrawal.',
}

export default function GamingPage() {
  return (
    <ShellLayout>
      <DustGamingUltimate />
    </ShellLayout>
  )
}
