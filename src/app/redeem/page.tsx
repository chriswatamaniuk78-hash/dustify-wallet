import type { Metadata } from 'next'
import ShellLayout from '@/components/shell/ShellLayout'
import RedeemFlow from '@/components/redeem/RedeemFlow'

export const metadata: Metadata = { title: 'Redeem Points' }

export default function RedeemPage() {
  return (
    <ShellLayout>
      <div style={{ maxWidth: 560, margin: '0 auto' }}>
        <div style={{ marginBottom: 28 }}>
          <div className="font-mono" style={{ fontSize: 10, letterSpacing: '0.2em', color: 'var(--gold-warm)', textTransform: 'uppercase', marginBottom: 4 }}>
            Waterfall Rewards
          </div>
          <h1 className="font-display" style={{ fontSize: 28, fontWeight: 500, letterSpacing: '-0.02em' }}>
            Redeem Points
          </h1>
        </div>
        <RedeemFlow />
      </div>
    </ShellLayout>
  )
}
