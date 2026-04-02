'use client'

import { formatUSDC, formatPoints, getTierProgress, getPointsToNextTier } from '@/types'
import type { SoulWallet } from '@/types'

interface StatsRowProps {
  wallet: SoulWallet
  portfolioValue: number
  botTradesToday: number
  pnlToday: number
}

export default function StatsRow({
  wallet,
  portfolioValue,
  botTradesToday,
  pnlToday,
}: StatsRowProps) {
  const tierProgress = getTierProgress(wallet.pointsBalance, wallet.rewardsTier)
  const ptsToNext = getPointsToNextTier(wallet.pointsBalance, wallet.rewardsTier)
  const pnlPositive = pnlToday >= 0

  return (
    <div
      className="animate-fade-up delay-2"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
        gap: 12,
        marginBottom: 24,
      }}
    >
      {/* Portfolio value */}
      <div className="stat-block">
        <div
          className="font-mono"
          style={{ fontSize: 10, letterSpacing: '0.15em', color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: 8 }}
        >
          Portfolio
        </div>
        <div
          className="font-display"
          style={{ fontSize: 26, fontWeight: 600, color: 'var(--gold)', letterSpacing: '-0.02em', lineHeight: 1 }}
        >
          {formatUSDC(portfolioValue)}
        </div>
        <div
          className="font-mono"
          style={{
            fontSize: 11,
            color: pnlPositive ? 'var(--success)' : 'var(--danger)',
            marginTop: 6,
          }}
        >
          {pnlPositive ? '▲' : '▼'} {pnlPositive ? '+' : ''}{formatUSDC(pnlToday)} today
        </div>
      </div>

      {/* Bot trades */}
      <div className="stat-block">
        <div
          className="font-mono"
          style={{ fontSize: 10, letterSpacing: '0.15em', color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: 8 }}
        >
          Bot trades
        </div>
        <div
          className="font-display"
          style={{ fontSize: 26, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.02em', lineHeight: 1 }}
        >
          {botTradesToday.toLocaleString()}
        </div>
        <div
          className="font-mono"
          style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 6 }}
        >
          Today · 0.10% fee
        </div>
      </div>

      {/* Points */}
      <div className="stat-block">
        <div
          className="font-mono"
          style={{ fontSize: 10, letterSpacing: '0.15em', color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: 8 }}
        >
          Dust points
        </div>
        <div
          className="font-display"
          style={{ fontSize: 26, fontWeight: 600, color: 'var(--gold-bright)', letterSpacing: '-0.02em', lineHeight: 1 }}
        >
          {formatPoints(wallet.pointsBalance)}
        </div>
        <div
          className="font-mono"
          style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 6 }}
        >
          ≈ {formatUSDC(wallet.pointsBalance / 100)} USDC
        </div>
      </div>

      {/* Tier progress */}
      <div className="stat-block">
        <div
          className="font-mono"
          style={{ fontSize: 10, letterSpacing: '0.15em', color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: 8 }}
        >
          Tier progress
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <div
            className="font-display"
            style={{ fontSize: 26, fontWeight: 600, color: 'var(--gold-warm)', letterSpacing: '-0.02em', lineHeight: 1 }}
          >
            {tierProgress}%
          </div>
          <div
            className="font-mono"
            style={{ fontSize: 11, color: 'var(--text-secondary)' }}
          >
            {wallet.rewardsTier}
          </div>
        </div>
        {/* Progress bar */}
        <div
          style={{
            height: 3,
            background: 'rgba(255,255,255,0.08)',
            borderRadius: 100,
            overflow: 'hidden',
            marginTop: 8,
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${tierProgress}%`,
              borderRadius: 100,
              background: 'linear-gradient(90deg, var(--gold-warm), var(--gold-bright))',
              boxShadow: '0 0 8px rgba(212,175,55,0.5)',
              transition: 'width 1s ease',
            }}
          />
        </div>
        {ptsToNext !== null && (
          <div
            className="font-mono"
            style={{ fontSize: 10, color: 'var(--text-tertiary)', marginTop: 5 }}
          >
            {formatPoints(ptsToNext)} pts to next tier
          </div>
        )}
      </div>
    </div>
  )
}
