import type { Metadata } from 'next'
import ShellLayout from '@/components/shell/ShellLayout'
import AutonomousTradingBotFull from '@/components/trade/AutonomousTradingBotFull'

export const metadata: Metadata = {
  title: 'Trade — Soul Wallet',
  description: 'Free autonomous trading bot. Phantom Flow™ 84.2% win rate strategy.',
}

export default function TradePage() {
  return (
    <ShellLayout>
      <AutonomousTradingBotFull />
    </ShellLayout>
  )
}
