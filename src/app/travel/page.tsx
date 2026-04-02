import type { Metadata } from 'next'
import ShellLayout from '@/components/shell/ShellLayout'
import DustTravel from '@/components/travel/DustTravel'

export const metadata: Metadata = { title: 'Dust Travel' }

export default function TravelPage() {
  return (
    <ShellLayout>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
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
            Dust Travel
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 6, lineHeight: 1.6 }}>
            AI-planned trips. 2.5% fee. Earn Waterfall points on every booking.
            No Expedia markup. No hidden fees.
          </p>
        </div>
        <DustTravel />
      </div>
    </ShellLayout>
  )
}
