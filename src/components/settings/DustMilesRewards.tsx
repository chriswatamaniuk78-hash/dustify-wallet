'use client'

import { formatPoints } from '@/types'

export default function DustMilesRewards() {
  const points = 18420
  const usdcValue = points / 100

  return (
    <section style={{ display: 'grid', gap: 10 }}>
      <h2 className="font-display" style={{ margin: 0, fontSize: 28 }}>DustMiles Rewards</h2>
      <div style={{ border: '1px solid var(--border-gold-1)', borderRadius: 12, padding: 14, background: 'var(--glass-2)' }}>
        <p className="font-mono" style={{ margin: 0, fontSize: 12, color: 'var(--text-secondary)' }}>
          Current balance: {formatPoints(points)} points
        </p>
        <p className="font-mono" style={{ margin: '8px 0 0', fontSize: 12, color: 'var(--text-secondary)' }}>
          Redeemable value: ${usdcValue.toFixed(2)} USDC
        </p>
      </div>
    </section>
  )
}
