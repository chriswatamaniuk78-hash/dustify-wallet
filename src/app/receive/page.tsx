import type { Metadata } from 'next'
import ShellLayout from '@/components/shell/ShellLayout'
import ReceiveScreen from '@/components/receive/ReceiveScreen'

export const metadata: Metadata = { title: 'Receive USDC' }

export default function ReceivePage() {
  return (
    <ShellLayout>
      <div style={{ maxWidth: 520, margin: '0 auto' }}>
        <div style={{ marginBottom: 28 }}>
          <div className="font-mono" style={{ fontSize: 10, letterSpacing: '0.2em', color: 'var(--gold-warm)', textTransform: 'uppercase', marginBottom: 4 }}>
            Soul Wallet
          </div>
          <h1 className="font-display" style={{ fontSize: 28, fontWeight: 500, letterSpacing: '-0.02em' }}>
            Receive USDC
          </h1>
        </div>
        <ReceiveScreen />
      </div>
    </ShellLayout>
  )
}
