'use client'

import { useMemo } from 'react'
import { formatUSDC, formatPoints } from '@/types'

export default function DashboardEnhanced() {
  const snapshot = useMemo(
    () => ({
      usdcBalance: 1284.22,
      pointsBalance: 18340,
      rewardRate: 1.25,
    }),
    []
  )

  return (
    <section style={{ display: 'grid', gap: 12 }}>
      <header>
        <h2 className="font-display" style={{ fontSize: 28, margin: 0 }}>
          Wallet Dashboard
        </h2>
        <p className="font-mono" style={{ marginTop: 8, color: 'var(--text-secondary)', fontSize: 12 }}>
          Live portfolio insights, rewards pacing, and session safety checks.
        </p>
      </header>

      <div style={{ display: 'grid', gap: 10, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        <article style={{ border: '1px solid var(--border-gold-1)', borderRadius: 12, padding: 14, background: 'var(--glass-2)' }}>
          <div className="font-mono" style={{ fontSize: 11, color: 'var(--text-secondary)' }}>USDC Balance</div>
          <div className="font-display" style={{ marginTop: 6, fontSize: 24 }}>{formatUSDC(snapshot.usdcBalance)}</div>
        </article>
        <article style={{ border: '1px solid var(--border-gold-1)', borderRadius: 12, padding: 14, background: 'var(--glass-2)' }}>
          <div className="font-mono" style={{ fontSize: 11, color: 'var(--text-secondary)' }}>DustMiles Balance</div>
          <div className="font-display" style={{ marginTop: 6, fontSize: 24 }}>{formatPoints(snapshot.pointsBalance)}</div>
        </article>
        <article style={{ border: '1px solid var(--border-gold-1)', borderRadius: 12, padding: 14, background: 'var(--glass-2)' }}>
          <div className="font-mono" style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Reward Multiplier</div>
          <div className="font-display" style={{ marginTop: 6, fontSize: 24 }}>{snapshot.rewardRate.toFixed(2)}x</div>
        </article>
      </div>
    </section>
  )
}
