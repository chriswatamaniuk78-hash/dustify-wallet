import type { Metadata } from 'next'
import ShellLayout from '@/components/shell/ShellLayout'
import DustTrade from '@/components/trade/DustTrade'

export const metadata: Metadata = {
  title: 'Trade — Soul Wallet',
  description: 'Free autonomous trading bot. Phantom Flow™ 84.2% win rate strategy.',
}

export default function TradePage() {
  return (
    <ShellLayout>
      <DustTrade />
    </ShellLayout>
  )
}
