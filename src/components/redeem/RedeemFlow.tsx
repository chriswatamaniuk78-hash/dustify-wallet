'use client'

import { useState, useMemo } from 'react'
import { Spinner, StatusBadge } from '@/components/ui'
import {
  formatUSDC,
  formatPoints,
  getTierConfig,
  getTierProgress,
  getPointsToNextTier,
  TIER_CONFIGS,
} from '@/types'
import type { SoulWallet } from '@/types'

// Wallet defaults — replaced by real data from API/context in production
const DEFAULT_USER = { id: 'user_local', name: 'Sovereign Holder', email: 'holder@dustify.local', avatarUrl: null, kycLevel: 'EMAIL_VERIFIED', createdAt: new Date().toISOString() }
const DEFAULT_WALLET: SoulWallet = {
  id: 'sw_local',
  userId: 'user_local',
  walletAddress: '0xD4AF3789AbCdEf012345678901234567890ABCDE',
  sbtTokenId: '847',
  usdcBalance: 0,
  pointsBalance: 0,
  rewardsTier: 'SPARK',
  isQuantumShielded: true,
  tierUpdatedAt: new Date().toISOString(),
  mintedAt: new Date().toISOString(),
}
const DEFAULT_TRANSACTIONS: any[] = []
const DEFAULT_BOT_CONFIG = { isEnabled: false, strategy: 'CONSERVATIVE', maxPositionSize: 1000 }
const DEFAULT_BOT_STATS = { tradesToday: 0, pnlToday: 0, feesGeneratedToday: 0 }
const DEFAULT_POSITIONS: any[] = []


const POINTS_PER_USDC = 100
const MIN_REDEEM = 1000    // 1,000 pts minimum = $10

function RedeemSlider({
  points,
  max,
  onChange,
}: {
  points: number
  max: number
  onChange: (v: number) => void
}) {
  const pct = max > 0 ? (points / max) * 100 : 0
  const usdcValue = points / POINTS_PER_USDC

  return (
    <div>
      {/* Large value display */}
      <div style={{ textAlign: 'center', padding: '20px 0 12px' }}>
        <div
          className="font-display"
          style={{
            fontSize: 52,
            fontWeight: 600,
            color: 'var(--gold-bright)',
            letterSpacing: '-0.03em',
            lineHeight: 1,
          }}
        >
          {formatPoints(points)}
        </div>
        <div
          className="font-mono"
          style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 6 }}
        >
          pts = {formatUSDC(usdcValue)} USDC
        </div>
      </div>

      {/* Slider track */}
      <div style={{ padding: '8px 0 20px', position: 'relative' }}>
        <div
          style={{
            height: 6,
            background: 'var(--glass-3)',
            borderRadius: 100,
            overflow: 'hidden',
            marginBottom: 8,
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${pct}%`,
              borderRadius: 100,
              background: 'linear-gradient(90deg, var(--gold-warm), var(--gold-bright))',
              boxShadow: '0 0 10px rgba(212,175,55,0.5)',
              transition: 'width 0.1s',
            }}
          />
        </div>
        <input
          type="range"
          min={MIN_REDEEM}
          max={max}
          step={100}
          value={points}
          onChange={e => onChange(parseInt(e.target.value))}
          style={{
            position: 'absolute',
            top: 4,
            left: 0,
            width: '100%',
            opacity: 0,
            cursor: 'pointer',
            height: 22,
          }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span className="font-mono" style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>
            {formatPoints(MIN_REDEEM)} pts
          </span>
          <span className="font-mono" style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>
            {formatPoints(max)} pts
          </span>
        </div>
      </div>

      {/* Quick select buttons */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {[0.25, 0.5, 0.75, 1].map(fraction => {
          const val = Math.max(MIN_REDEEM, Math.floor(max * fraction / 100) * 100)
          const label = fraction === 1 ? 'All' : `${fraction * 100}%`
          return (
            <button
              key={fraction}
              onClick={() => onChange(val)}
              style={{
                flex: 1,
                padding: '8px 4px',
                borderRadius: 10,
                border: `1px solid ${points === val ? 'var(--border-gold-2)' : 'var(--border-gold-0)'}`,
                background: points === val ? 'var(--gold-glass-2)' : 'var(--glass-1)',
                color: points === val ? 'var(--gold)' : 'var(--text-secondary)',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 12,
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ── Tier breakdown ───────────────────────────────────────────

function TierBreakdown({ currentPoints }: { currentPoints: number }) {
  const currentConfig = getTierConfig(DEFAULT_WALLET.rewardsTier)
  const progress = getTierProgress(currentPoints, DEFAULT_WALLET.rewardsTier)
  const ptsToNext = getPointsToNextTier(currentPoints, DEFAULT_WALLET.rewardsTier)

  return (
    <div
      style={{
        padding: '20px',
        background: 'var(--glass-2)',
        border: '1px solid var(--border-gold-1)',
        borderRadius: 14,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div>
          <div
            className="font-mono"
            style={{ fontSize: 10, color: 'var(--text-tertiary)', letterSpacing: '0.12em', marginBottom: 4 }}
          >
            CURRENT TIER
          </div>
          <div
            className="font-display"
            style={{ fontSize: 20, fontWeight: 500, color: currentConfig.color }}
          >
            {currentConfig.label}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div
            className="font-mono"
            style={{ fontSize: 24, fontWeight: 500, color: 'var(--gold-warm)' }}
          >
            {currentConfig.multiplier}x
          </div>
          <div className="font-mono" style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>
            multiplier
          </div>
        </div>
      </div>

      {/* Tier progress */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span className="font-mono" style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
            {formatPoints(currentPoints)} pts this month
          </span>
          {ptsToNext !== null && (
            <span className="font-mono" style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
              {formatPoints(ptsToNext)} to next tier
            </span>
          )}
        </div>
        <div style={{ height: 5, background: 'rgba(255,255,255,0.06)', borderRadius: 100, overflow: 'hidden' }}>
          <div
            style={{
              height: '100%',
              width: `${progress}%`,
              borderRadius: 100,
              background: `linear-gradient(90deg, ${currentConfig.color}aa, ${currentConfig.color})`,
              transition: 'width 0.8s ease',
            }}
          />
        </div>
      </div>

      {/* All tiers mini list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {TIER_CONFIGS.map(tier => {
          const isCurrent = tier.tier === DEFAULT_WALLET.rewardsTier
          const isPast = TIER_CONFIGS.indexOf(tier) < TIER_CONFIGS.findIndex(t => t.tier === DEFAULT_WALLET.rewardsTier)
          return (
            <div
              key={tier.tier}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '7px 10px',
                borderRadius: 8,
                background: isCurrent ? `${tier.color}15` : 'transparent',
                border: isCurrent ? `1px solid ${tier.color}35` : '1px solid transparent',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    background: tier.color,
                    opacity: isCurrent ? 1 : isPast ? 0.5 : 0.25,
                  }}
                />
                <span
                  className="font-mono"
                  style={{
                    fontSize: 11,
                    color: isCurrent ? tier.color : isPast ? 'var(--text-tertiary)' : 'var(--text-ghost)',
                    fontWeight: isCurrent ? 500 : 400,
                  }}
                >
                  {tier.label}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <span className="font-mono" style={{ fontSize: 10, color: isCurrent ? 'var(--text-secondary)' : 'var(--text-ghost)' }}>
                  {formatPoints(tier.minPoints)}+ pts/mo
                </span>
                <span
                  className="font-mono"
                  style={{
                    fontSize: 11,
                    fontWeight: 500,
                    color: isCurrent ? tier.color : 'var(--text-ghost)',
                  }}
                >
                  {tier.multiplier}x
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Main component ───────────────────────────────────────────

export default function RedeemFlow() {
  const maxRedeemable = Math.floor(DEFAULT_WALLET.pointsBalance / 100) * 100  // round to nearest 100
  const [redeemPoints, setRedeemPoints] = useState(
    Math.min(5000, maxRedeemable)
  )
  const [step, setStep] = useState<'select' | 'confirm' | 'done'>('select')
  const [redeeming, setRedeeming] = useState(false)

  const usdcOut = redeemPoints / POINTS_PER_USDC
  const remainingPoints = DEFAULT_WALLET.pointsBalance - redeemPoints

  const tierConfig = getTierConfig(DEFAULT_WALLET.rewardsTier)

  async function handleRedeem() {
    setRedeeming(true)
    await new Promise(r => setTimeout(r, 1800))
    setRedeeming(false)
    setStep('done')
  }

  if (step === 'done') {
    return (
      <div className="glass-heavy animate-fade-up" style={{ padding: 40, textAlign: 'center' }}>
        <div
          style={{
            width: 72, height: 72, borderRadius: '50%',
            background: 'var(--gold-glass-3)',
            border: '2px solid var(--border-gold-2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 24px',
            boxShadow: '0 0 30px rgba(212,175,55,0.25)',
          }}
        >
          <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
            <path d="M5 15l8 8 12-12" stroke="var(--gold)" strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <div className="font-display" style={{ fontSize: 28, fontWeight: 500, marginBottom: 8 }}>
          Points redeemed
        </div>
        <div style={{ fontSize: 15, color: 'var(--text-secondary)', marginBottom: 4 }}>
          {formatPoints(redeemPoints)} pts converted to{' '}
          <span style={{ color: 'var(--gold)' }}>{formatUSDC(usdcOut)} USDC</span>
        </div>
        <div className="font-mono" style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 32 }}>
          Added to your wallet balance instantly
        </div>

        <div
          style={{
            padding: '16px 20px',
            background: 'var(--glass-2)',
            border: '1px solid var(--border-gold-1)',
            borderRadius: 12,
            marginBottom: 28,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <div className="font-mono" style={{ fontSize: 10, color: 'var(--text-tertiary)', marginBottom: 4 }}>REMAINING POINTS</div>
            <div className="font-display" style={{ fontSize: 24, color: 'var(--gold-bright)' }}>
              {formatPoints(remainingPoints)}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className="font-mono" style={{ fontSize: 10, color: 'var(--text-tertiary)', marginBottom: 4 }}>NEW BALANCE</div>
            <div className="font-display" style={{ fontSize: 24, color: 'var(--gold)' }}>
              {formatUSDC(DEFAULT_WALLET.usdcBalance + usdcOut)}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            className="btn-glass"
            style={{ flex: 1, padding: '13px', fontSize: 14 }}
            onClick={() => { setStep('select'); setRedeemPoints(Math.min(5000, maxRedeemable)) }}
          >
            Redeem more
          </button>
          <button
            className="btn-sovereign"
            style={{ flex: 1, padding: '13px', fontSize: 14 }}
          >
            Back to wallet
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Points balance card */}
      <div className="glass-heavy animate-fade-up" style={{ padding: 28 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <div className="font-mono" style={{ fontSize: 10, letterSpacing: '0.18em', color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: 8 }}>
              Available to redeem
            </div>
            <div className="font-display" style={{ fontSize: 44, fontWeight: 600, color: 'var(--gold-bright)', letterSpacing: '-0.03em', lineHeight: 1 }}>
              {formatPoints(DEFAULT_WALLET.pointsBalance)}
            </div>
            <div className="font-mono" style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 6 }}>
              pts = {formatUSDC(DEFAULT_WALLET.pointsBalance / POINTS_PER_USDC)} USDC
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <StatusBadge variant="gold">{tierConfig.label}</StatusBadge>
            <div className="font-mono" style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 6 }}>
              {tierConfig.multiplier}x multiplier active
            </div>
          </div>
        </div>

        <div className="gold-divider" style={{ marginBottom: 24 }} />

        {step === 'select' && (
          <>
            <RedeemSlider
              points={redeemPoints}
              max={maxRedeemable}
              onChange={setRedeemPoints}
            />

            {/* Fee/rate info */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: 10,
                marginTop: 24,
                marginBottom: 8,
              }}
            >
              {[
                { label: 'Rate',     value: '100 pts = $1.00' },
                { label: 'You get',  value: formatUSDC(usdcOut)  },
                { label: 'Remaining', value: `${formatPoints(remainingPoints)} pts` },
              ].map(item => (
                <div
                  key={item.label}
                  style={{
                    padding: '12px',
                    background: 'var(--glass-2)',
                    border: '1px solid var(--border-gold-0)',
                    borderRadius: 10,
                    textAlign: 'center',
                  }}
                >
                  <div className="font-mono" style={{ fontSize: 9, color: 'var(--text-tertiary)', marginBottom: 5, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                    {item.label}
                  </div>
                  <div className="font-mono" style={{ fontSize: 13, color: 'var(--gold-warm)' }}>
                    {item.value}
                  </div>
                </div>
              ))}
            </div>

            <button
              className="btn-sovereign"
              style={{ width: '100%', padding: '14px', fontSize: 15, marginTop: 20 }}
              onClick={() => setStep('confirm')}
              disabled={redeemPoints < MIN_REDEEM}
            >
              Redeem {formatPoints(redeemPoints)} pts → {formatUSDC(usdcOut)}
            </button>
          </>
        )}

        {step === 'confirm' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Confirm details */}
            <div
              style={{
                padding: '20px',
                background: 'var(--glass-2)',
                border: '1px solid var(--border-gold-1)',
                borderRadius: 14,
              }}
            >
              {[
                { label: 'Points burned',    value: `${formatPoints(redeemPoints)} pts`, highlight: true },
                { label: 'USDC credited',    value: formatUSDC(usdcOut),                highlight: true },
                { label: 'Conversion rate',  value: '100 pts = $1.00 USDC' },
                { label: 'Points remaining', value: formatPoints(remainingPoints) },
                { label: 'Destination',      value: 'Your Soul Wallet balance' },
                { label: 'Settlement',       value: 'Instant' },
              ].map(row => (
                <div
                  key={row.label}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '9px 0',
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                  }}
                >
                  <span className="font-mono" style={{ fontSize: 11, color: 'var(--text-tertiary)', letterSpacing: '0.06em' }}>
                    {row.label.toUpperCase()}
                  </span>
                  <span style={{ fontSize: 13, fontWeight: row.highlight ? 500 : 400, color: row.highlight ? 'var(--gold)' : 'var(--text-primary)' }}>
                    {row.value}
                  </span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                className="btn-ghost"
                style={{ flex: 1, padding: '13px', fontSize: 14 }}
                onClick={() => setStep('select')}
                disabled={redeeming}
              >
                Adjust
              </button>
              <button
                className="btn-sovereign"
                style={{ flex: 2, padding: '13px', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}
                onClick={handleRedeem}
                disabled={redeeming}
              >
                {redeeming ? (
                  <><Spinner size={18} color="#000" />Converting…</>
                ) : (
                  `Confirm redemption`
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Tier breakdown — always visible */}
      <div className="animate-fade-up delay-2">
        <TierBreakdown currentPoints={DEFAULT_WALLET.pointsBalance} />
      </div>

      {/* Expiry notice */}
      <div
        className="animate-fade-up delay-3"
        style={{
          padding: '12px 16px',
          background: 'rgba(251,191,36,0.06)',
          border: '1px solid rgba(251,191,36,0.18)',
          borderRadius: 12,
          display: 'flex',
          gap: 10,
          alignItems: 'flex-start',
        }}
      >
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
          <circle cx="7.5" cy="7.5" r="6.5" stroke="var(--warning)" strokeWidth="1.2" />
          <path d="M7.5 4.5v4M7.5 10.5v.5" stroke="var(--warning)" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
        <div className="font-mono" style={{ fontSize: 11, color: 'var(--warning)', lineHeight: 1.6 }}>
          Points expire 90 days after they are earned. Your oldest points expire in 23 days. Redeem before March 30 to lock in their value.
        </div>
      </div>
    </div>
  )
}
