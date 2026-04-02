import type { Metadata } from 'next'
import ShellLayout from '@/components/shell/ShellLayout'
import DustGaming from '@/components/gaming/DustGaming'

export const metadata: Metadata = { title: 'Dust Gaming' }

export default function GamingPage() {
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
            Dust Gaming
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 6, lineHeight: 1.6 }}>
            SBT-owned games · True ownership · Resellable licences · Tournament prize pools in smart contracts · 5% dev fee vs Steam's 30%
          </p>
        </div>
        <DustGaming />
      </div>
    </ShellLayout>
  )
}
