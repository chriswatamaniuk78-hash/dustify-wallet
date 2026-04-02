import type { Metadata } from 'next'
import ShellLayout from '@/components/shell/ShellLayout'
import DustTrade from '@/components/trade/DustTrade'

export const metadata: Metadata = { title: 'Dust Trade' }

export default function TradePage() {
  return (
    <ShellLayout>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <div style={{ marginBottom: 28 }}>
          <div
            className="font-mono"
            style={{
              fontSize: 10,
              letterSpacing: '0.2em',
              color: 'var(--gold-warm)',
              textTransform: 'uppercase',
              marginBottom: 4,
            }}
          >
            Soul Wallet
          </div>
          <h1
            className="font-display"
            style={{ fontSize: 32, fontWeight: 500, letterSpacing: '-0.025em', lineHeight: 1.1 }}
          >
            Dust Trade
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 6, lineHeight: 1.6 }}>
            Stocks · Crypto · Forex · Options · Autonomous bot — completely free. Earn Waterfall points on every trade.
          </p>
        </div>
        <DustTrade />
      </div>
    </ShellLayout>
  )
}
