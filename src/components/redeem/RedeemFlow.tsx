'use client'

import { useMemo } from 'react'

export default function RedeemFlow() {
  const model = useMemo(
    () => ({
      points: 18420,
      conversionRate: 100,
    }),
    []
  )

  const usdcEstimate = model.points / model.conversionRate

  return (
    <section style={{ display: 'grid', gap: 12, maxWidth: 560 }}>
      <header>
        <h2 className="font-display" style={{ margin: 0, fontSize: 28 }}>Redeem Points</h2>
        <p className="font-mono" style={{ marginTop: 8, fontSize: 12, color: 'var(--text-secondary)' }}>
          Convert points to USDC with auditable and fixed-rate settlement logic.
        </p>
      </header>
      <div style={{ border: '1px solid var(--border-gold-1)', borderRadius: 12, padding: 14, background: 'var(--glass-2)' }}>
        <div className="font-mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          {model.points.toLocaleString()} points {'->'} ${usdcEstimate.toFixed(2)} USDC
        </div>
      </div>
    </section>
  )
}
