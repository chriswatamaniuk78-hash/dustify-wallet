'use client'

import { formatUSDC, formatPoints, getTierConfig } from '@/types'
import type { SoulWallet, User } from '@/types'

interface BalanceHeroProps {
  wallet: SoulWallet
  user: User
}

export default function BalanceHero({ wallet, user }: BalanceHeroProps) {
  const tierConfig = getTierConfig(wallet.rewardsTier)
  const usdcFromPoints = wallet.pointsBalance / 100

  const initials = user.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="animate-fade-up delay-1">
      {/* Main balance card */}
      <div
        className="glass-heavy"
        style={{ padding: '32px', marginBottom: 16 }}
      >
        {/* Top row: user identity */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {/* Gold ring avatar */}
            <div className="gold-ring" style={{ width: 52, height: 52 }}>
              <div
                style={{
                  width: '100%', height: '100%',
                  borderRadius: '50%',
                  background: 'var(--void-2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: "'Playfair Display', serif",
                  fontSize: 17,
                  fontWeight: 600,
                  color: 'var(--gold)',
                }}
              >
                {initials}
              </div>
            </div>
            <div>
              <div
                className="font-display"
                style={{ fontSize: 17, fontWeight: 500, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}
              >
                {user.name}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 3 }}>
                {/* Tier badge */}
                <span
                  className="font-mono"
                  style={{
                    fontSize: 10,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: tierConfig.color,
                    background: `${tierConfig.color}18`,
                    border: `1px solid ${tierConfig.color}40`,
                    padding: '2px 8px',
                    borderRadius: 100,
                  }}
                >
                  {tierConfig.label} · {tierConfig.multiplier}x
                </span>
              </div>
            </div>
          </div>

          {/* SBT status */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
              gap: 4,
            }}
          >
            <div className="live-dot">Quantum active</div>
            <div
              className="font-mono"
              style={{ fontSize: 10, color: 'var(--text-tertiary)' }}
            >
              SBT #{wallet.sbtTokenId?.padStart(5, '0')}
            </div>
          </div>
        </div>

        {/* Balance display */}
        <div style={{ marginBottom: 28 }}>
          <div
            className="font-mono"
            style={{
              fontSize: 11,
              letterSpacing: '0.18em',
              color: 'var(--text-tertiary)',
              textTransform: 'uppercase',
              marginBottom: 8,
            }}
          >
            Total balance
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
            <div
              className="font-display"
              style={{
                fontSize: 52,
                fontWeight: 600,
                color: 'var(--gold)',
                letterSpacing: '-0.03em',
                lineHeight: 1,
              }}
            >
              {formatUSDC(wallet.usdcBalance)}
            </div>
            <div
              className="font-mono"
              style={{ fontSize: 13, color: 'var(--text-secondary)' }}
            >
              USDC
            </div>
          </div>
          <div
            className="font-mono"
            style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 6 }}
          >
            + {formatPoints(wallet.pointsBalance)} pts ≈ {formatUSDC(usdcFromPoints)} redeemable
          </div>
        </div>

        {/* Divider */}
        <div className="gold-divider" style={{ marginBottom: 24 }} />

        {/* Quick actions */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            className="btn-sovereign"
            style={{ flex: 1, padding: '13px 20px', fontSize: 14 }}
          >
            Send
          </button>
          <button
            className="btn-glass"
            style={{ flex: 1, padding: '13px 20px', fontSize: 14 }}
          >
            Receive
          </button>
          <button
            className="btn-glass"
            style={{ flex: 1, padding: '13px 20px', fontSize: 14 }}
          >
            Redeem pts
          </button>
          <button
            className="btn-ghost"
            style={{ flex: 1, padding: '13px 20px', fontSize: 14 }}
          >
            Add funds
          </button>
        </div>
      </div>
    </div>
  )
}
