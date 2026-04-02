import type { Metadata } from 'next'
import ShellLayout from '@/components/shell/ShellLayout'
import SendFlow from '@/components/send/SendFlow'

export const metadata: Metadata = { title: 'Send USDC' }

export default function SendPage() {
  return (
    <ShellLayout>
      <div style={{ maxWidth: 560, margin: '0 auto' }}>
        <div style={{ marginBottom: 28 }}>
          <div className="font-mono" style={{ fontSize: 10, letterSpacing: '0.2em', color: 'var(--gold-warm)', textTransform: 'uppercase', marginBottom: 4 }}>
            Soul Wallet
          </div>
          <h1 className="font-display" style={{ fontSize: 28, fontWeight: 500, letterSpacing: '-0.02em' }}>
            Send USDC
          </h1>
        </div>
        <SendFlow />
      </div>
    </ShellLayout>
  )
}
