'use client'
// ============================================================
// SOUL WALLET — Enhanced Dashboard v2
// Incorporating best features from: Phantom, Robinhood, Revolut,
// Coinbase, MetaMask — plus everything they ALL lack
// ============================================================

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import {
  formatUSDC, formatPoints, getTierConfig, getPointsToNextTier, getTierProgress,
  type SoulWallet, type Transaction, type Position,
} from '@/types'
import {
  MOCK_WALLET, MOCK_USER, MOCK_TRANSACTIONS, MOCK_POSITIONS, MOCK_BOT_STATS,
} from '@/lib/mock-data'

// ── Portfolio sparkline (SVG) ─────────────────────────────────
function Sparkline({
  data, color, width = 120, height = 40, fill = true,
}: { data: number[]; color: string; width?: number; height?: number; fill?: boolean }) {
  if (!data.length) return null
  const min = Math.min(...data), max = Math.max(...data)
  const range = max - min || 1
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width
    const y = height - ((v - min) / range) * (height - 4) - 2
    return `${x.toFixed(1)},${y.toFixed(1)}`
  })
  const pathD = `M ${pts.join(' L ')}`
  const fillD = `${pathD} L ${width},${height} L 0,${height} Z`
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: 'visible' }}>
      {fill && (
        <defs>
          <linearGradient id={`sg-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.18" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
      )}
      {fill && <path d={fillD} fill={`url(#sg-${color.replace('#','')})`} />}
      <path d={pathD} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// ── Tier progress ring ────────────────────────────────────────
function TierProgressRing({ wallet }: { wallet: SoulWallet }) {
  const cfg = getTierConfig(wallet.rewardsTier)
  const progress = getTierProgress(wallet.pointsBalance, wallet.rewardsTier)
  const toNext = getPointsToNextTier(wallet.pointsBalance, wallet.rewardsTier)
  const r = 36, c = 2 * Math.PI * r
  const dash = (progress / 100) * c

  return (
    <div style={{ position: 'relative', width: 96, height: 96, flexShrink: 0 }}>
      <svg width={96} height={96} viewBox="0 0 96 96" style={{ transform: 'rotate(-90deg)' }}>
        {/* Track */}
        <circle cx={48} cy={48} r={r} fill="none" stroke="var(--glass-3)" strokeWidth={6} />
        {/* Progress */}
        <circle cx={48} cy={48} r={r} fill="none" stroke={cfg.color} strokeWidth={6}
          strokeDasharray={`${dash} ${c}`} strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 1.2s cubic-bezier(.4,0,.2,1)' }} />
      </svg>
      {/* Center */}
      <div style={{
        position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 1,
      }}>
        <span className="font-mono" style={{ fontSize: 18, fontWeight: 600, color: cfg.color }}>{progress}%</span>
        <span className="font-mono" style={{ fontSize: 8, letterSpacing: '0.1em', color: 'var(--text-tertiary)' }}>
          {cfg.label.toUpperCase()}
        </span>
      </div>
    </div>
  )
}

// ── Live bot pulse ────────────────────────────────────────────
function BotLiveFeed() {
  const [trades, setTrades] = useState([
    { sym: 'BTC', side: 'BUY',  qty: '0.003', price: '$67,842', pnl: '+$2.04', ts: '2s ago' },
    { sym: 'ETH', side: 'SELL', qty: '0.8',   price: '$3,421',  pnl: '+$8.40', ts: '14s ago' },
    { sym: 'AAPL', side: 'BUY', qty: '1',     price: '$187.42', pnl: '+$0.32', ts: '47s ago' },
  ])
  const [flash, setFlash] = useState(false)

  useEffect(() => {
    const TICKERS = ['NVDA','SPY','BTC','ETH','SOL','TSLA','AAPL','EUR/USD']
    const interval = setInterval(() => {
      const sym = TICKERS[Math.floor(Math.random() * TICKERS.length)]
      const side = Math.random() > 0.5 ? 'BUY' : 'SELL'
      const pnl = (Math.random() * 20 - 3).toFixed(2)
      setTrades(prev => [{
        sym, side,
        qty: (Math.random() * 2).toFixed(3),
        price: `$${(Math.random() * 1000 + 100).toFixed(2)}`,
        pnl: `${Number(pnl) >= 0 ? '+' : ''}$${pnl}`,
        ts: 'just now',
      }, ...prev.slice(0, 4)])
      setFlash(true)
      setTimeout(() => setFlash(false), 400)
    }, 4500)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="glass" style={{ padding: '18px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--success)', boxShadow: '0 0 10px var(--success)', animation: 'pulseGold 1.5s ease-in-out infinite' }} />
          <span className="font-mono" style={{ fontSize: 10, color: 'var(--success)', letterSpacing: '0.12em' }}>BOT LIVE</span>
          <span className="font-mono" style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>· FREE</span>
        </div>
        <Link href="/trade" style={{ textDecoration: 'none' }}>
          <span className="font-mono" style={{ fontSize: 10, color: 'var(--gold-dim)', letterSpacing: '0.08em' }}>View all →</span>
        </Link>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {trades.map((t, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px',
            background: i === 0 && flash ? 'rgba(212,175,55,0.06)' : 'transparent',
            borderRadius: 8, transition: 'background 0.3s ease',
          }}>
            <div style={{
              width: 32, height: 20, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: t.side === 'BUY' ? 'rgba(74,222,128,0.12)' : 'rgba(248,113,113,0.12)',
            }}>
              <span className="font-mono" style={{ fontSize: 9, color: t.side === 'BUY' ? 'var(--success)' : 'var(--danger)' }}>
                {t.side}
              </span>
            </div>
            <span className="font-mono" style={{ fontSize: 12, color: 'var(--text-primary)', fontWeight: 500, flex: 1 }}>{t.sym}</span>
            <span className="font-mono" style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{t.price}</span>
            <span className="font-mono" style={{ fontSize: 11, color: t.pnl.startsWith('+') ? 'var(--success)' : 'var(--danger)', fontWeight: 500 }}>
              {t.pnl}
            </span>
            <span className="font-mono" style={{ fontSize: 9, color: 'var(--text-tertiary)', minWidth: 50, textAlign: 'right' }}>{t.ts}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Upcoming trip card ────────────────────────────────────────
function UpcomingTrip() {
  const trip = {
    destination: 'Los Angeles, CA',
    flag: '🇺🇸',
    flight: 'AC 221 · YEG → LAX',
    date: 'Feb 14, 07:15',
    hotel: 'The LINE LA · 4 nights',
    daysLeft: 28,
    weather: '23°C ☀️',
    code: 'AC8892',
  }

  return (
    <div className="glass" style={{ padding: '18px 20px', position: 'relative', overflow: 'hidden' }}>
      {/* Gradient accent */}
      <div style={{
        position: 'absolute', top: 0, right: 0, width: 100, height: 100,
        background: 'radial-gradient(circle, rgba(127,119,221,0.15) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <span className="font-mono" style={{ fontSize: 10, letterSpacing: '0.18em', color: 'var(--text-tertiary)' }}>UPCOMING TRIP</span>
        <Link href="/travel" style={{ textDecoration: 'none' }}>
          <span className="font-mono" style={{ fontSize: 10, color: 'var(--gold-dim)' }}>View →</span>
        </Link>
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 10, display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: 24, background: 'var(--glass-2)', flexShrink: 0,
        }}>
          {trip.flag}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 3 }}>{trip.destination}</div>
          <div className="font-mono" style={{ fontSize: 10, color: 'var(--text-tertiary)', marginBottom: 6 }}>
            {trip.flight}
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {[
              { label: trip.date, icon: '✈' },
              { label: trip.weather, icon: null },
              { label: `${trip.daysLeft}d away`, icon: '⏱' },
            ].map(({ label, icon }) => (
              <div key={label} style={{
                display: 'flex', alignItems: 'center', gap: 4,
                padding: '3px 8px', background: 'var(--glass-2)',
                border: '1px solid var(--border-void)', borderRadius: 100,
              }}>
                {icon && <span style={{ fontSize: 10 }}>{icon}</span>}
                <span className="font-mono" style={{ fontSize: 10, color: 'var(--text-secondary)' }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Market pulse strip ────────────────────────────────────────
function MarketPulse() {
  const [markets] = useState([
    { sym: 'BTC',    price: '$67,842', chg: '+3.24%', up: true },
    { sym: 'ETH',    price: '$3,421',  chg: '+2.18%', up: true },
    { sym: 'AAPL',   price: '$187.42', chg: '+0.82%', up: true },
    { sym: 'NVDA',   price: '$875.40', chg: '-1.24%', up: false },
    { sym: 'SPY',    price: '$522.80', chg: '+0.44%', up: true },
    { sym: 'EUR/USD',price: '1.0842',  chg: '-0.18%', up: false },
    { sym: 'GOLD',   price: '$2,341',  chg: '+0.62%', up: true },
    { sym: 'SOL',    price: '$142.80', chg: '+4.81%', up: true },
  ])

  return (
    <div style={{
      display: 'flex', gap: 0,
      background: 'var(--glass-1)',
      border: '1px solid var(--border-gold-0)',
      borderRadius: 10, overflow: 'hidden', marginBottom: 20,
    }}>
      {markets.map((m, i) => (
        <div key={m.sym} style={{
          flex: 1, padding: '10px 12px', textAlign: 'center',
          borderRight: i < markets.length - 1 ? '1px solid var(--border-void)' : 'none',
          minWidth: 90,
        }}>
          <div className="font-mono" style={{ fontSize: 10, color: 'var(--text-tertiary)', marginBottom: 3, letterSpacing: '0.06em' }}>
            {m.sym}
          </div>
          <div className="font-mono" style={{ fontSize: 11, color: 'var(--text-primary)', marginBottom: 2 }}>{m.price}</div>
          <div className="font-mono" style={{ fontSize: 10, color: m.up ? 'var(--success)' : 'var(--danger)' }}>{m.chg}</div>
        </div>
      ))}
    </div>
  )
}

// ── Portfolio chart ───────────────────────────────────────────
function PortfolioChart({ positions }: { positions: Position[] }) {
  const [range, setRange] = useState<'1D' | '1W' | '1M' | '3M' | 'YTD' | '1Y'>('1M')
  const totalValue = positions.reduce((s, p) => s + p.currentValue, 0)
  const totalPnL = positions.reduce((s, p) => s + p.unrealizedPnl, 0)
  const pnlPct = (totalPnL / (totalValue - totalPnL)) * 100

  // Generate mock sparkline data for portfolio
  const genData = (pts: number, trend: number) =>
    Array.from({ length: pts }, (_, i) => 80000 + i * trend + (Math.random() - 0.4) * 2000)

  const DATA: Record<typeof range, number[]> = {
    '1D': genData(48, 50),
    '1W': genData(28, 300),
    '1M': genData(30, 800),
    '3M': genData(90, 320),
    'YTD': genData(120, 280),
    '1Y':  genData(252, 140),
  }

  const chartData = DATA[range]
  const isUp = chartData[chartData.length - 1] > chartData[0]

  return (
    <div className="glass-heavy" style={{ padding: '24px', marginBottom: 16 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <div className="font-mono" style={{ fontSize: 10, letterSpacing: '0.18em', color: 'var(--text-tertiary)', marginBottom: 6 }}>
            TOTAL PORTFOLIO VALUE
          </div>
          <div className="font-display" style={{ fontSize: 46, fontWeight: 600, color: 'var(--gold)', letterSpacing: '-0.03em', lineHeight: 1 }}>
            {formatUSDC(totalValue)}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6 }}>
            <span className="font-mono" style={{ fontSize: 13, color: isUp ? 'var(--success)' : 'var(--danger)', fontWeight: 500 }}>
              {isUp ? '+' : ''}{formatUSDC(totalPnL)}
            </span>
            <span className="font-mono" style={{
              fontSize: 11, padding: '2px 8px', borderRadius: 100,
              background: isUp ? 'rgba(74,222,128,0.1)' : 'rgba(248,113,113,0.1)',
              color: isUp ? 'var(--success)' : 'var(--danger)',
              border: `1px solid ${isUp ? 'rgba(74,222,128,0.25)' : 'rgba(248,113,113,0.25)'}`,
            }}>
              {isUp ? '+' : ''}{pnlPct.toFixed(2)}%
            </span>
            <span className="font-mono" style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>all time</span>
          </div>
        </div>

        {/* Range selector */}
        <div style={{ display: 'flex', gap: 2, background: 'var(--glass-2)', borderRadius: 8, padding: 3 }}>
          {(['1D','1W','1M','3M','YTD','1Y'] as const).map(r => (
            <button key={r} onClick={() => setRange(r)}
              style={{
                padding: '4px 10px', borderRadius: 6, border: 'none', cursor: 'pointer', transition: 'all 0.15s',
                background: range === r ? 'var(--gold-glass-2)' : 'transparent',
                color: range === r ? 'var(--gold)' : 'var(--text-tertiary)',
                fontFamily: "'JetBrains Mono', monospace", fontSize: 11, fontWeight: range === r ? 500 : 400,
              }}>
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div style={{ width: '100%', height: 120, position: 'relative', marginBottom: 16 }}>
        <svg width="100%" height="100%" viewBox="0 0 600 120" preserveAspectRatio="none">
          <defs>
            <linearGradient id="portfolioGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={isUp ? '#4ade80' : '#f87171'} stopOpacity="0.2" />
              <stop offset="100%" stopColor={isUp ? '#4ade80' : '#f87171'} stopOpacity="0" />
            </linearGradient>
          </defs>
          {(() => {
            const min = Math.min(...chartData), max = Math.max(...chartData), range = max - min || 1
            const pts = chartData.map((v, i) => {
              const x = (i / (chartData.length - 1)) * 600
              const y = 110 - ((v - min) / range) * 100
              return `${x.toFixed(1)},${y.toFixed(1)}`
            })
            const pathD = `M ${pts.join(' L ')}`
            const fillD = `${pathD} L 600,120 L 0,120 Z`
            return (
              <>
                <path d={fillD} fill="url(#portfolioGrad)" />
                <path d={pathD} fill="none" stroke={isUp ? '#4ade80' : '#f87171'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </>
            )
          })()}
        </svg>
      </div>

      {/* Quick action bar */}
      <div style={{ display: 'flex', gap: 8 }}>
        {[
          { label: 'Send',       href: '/send',    style: 'sovereign' },
          { label: 'Receive',    href: '/receive', style: 'glass' },
          { label: 'Redeem pts', href: '/redeem',  style: 'glass' },
          { label: 'Add funds',  href: '#',        style: 'ghost' },
        ].map(({ label, href, style }) => (
          <Link key={label} href={href} style={{ flex: 1, textDecoration: 'none' }}>
            <button className={`btn-${style}`} style={{ width: '100%', padding: '11px 8px', fontSize: 13 }}>
              {label}
            </button>
          </Link>
        ))}
      </div>
    </div>
  )
}

// ── Position cards ────────────────────────────────────────────
function PositionRow({ pos }: { pos: Position }) {
  const isUp = pos.unrealizedPnl >= 0

  const data = Array.from({ length: 20 }, (_, i) =>
    pos.avgCostBasis + i * (pos.unrealizedPnl / pos.quantity / 20) + (Math.random() - 0.45) * 5
  )

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px',
      background: 'transparent', borderBottom: '1px solid var(--border-void)',
      transition: 'background 0.15s', cursor: 'pointer',
    }}
      onMouseEnter={e => (e.currentTarget.style.background = 'var(--glass-1)')}
      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
      {/* Symbol */}
      <div style={{ width: 40 }}>
        <div style={{ fontSize: 13, fontWeight: 500 }}>{pos.symbol}</div>
        <div className="font-mono" style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>
          {pos.assetClass}
        </div>
      </div>

      {/* Sparkline */}
      <div style={{ flex: 1 }}>
        <Sparkline data={data} color={isUp ? '#4ade80' : '#f87171'} width={100} height={30} />
      </div>

      {/* Price */}
      <div style={{ textAlign: 'right', minWidth: 90 }}>
        <div className="font-mono" style={{ fontSize: 13, color: 'var(--text-primary)' }}>
          {formatUSDC(pos.currentValue)}
        </div>
        <div className="font-mono" style={{ fontSize: 10, color: isUp ? 'var(--success)' : 'var(--danger)' }}>
          {isUp ? '+' : ''}{pos.unrealizedPnlPct.toFixed(2)}%
        </div>
      </div>

      {/* Day change */}
      <div className="font-mono" style={{
        fontSize: 11, padding: '3px 8px', borderRadius: 100, minWidth: 60, textAlign: 'center',
        background: pos.dayChangePct >= 0 ? 'rgba(74,222,128,0.08)' : 'rgba(248,113,113,0.08)',
        color: pos.dayChangePct >= 0 ? 'var(--success)' : 'var(--danger)',
      }}>
        {pos.dayChangePct >= 0 ? '+' : ''}{pos.dayChangePct.toFixed(2)}%
      </div>
    </div>
  )
}

// ── DustMiles widget ──────────────────────────────────────────
function DustMilesCard({ wallet }: { wallet: SoulWallet }) {
  const cfg = getTierConfig(wallet.rewardsTier)
  const toNext = getPointsToNextTier(wallet.pointsBalance, wallet.rewardsTier)
  const progress = getTierProgress(wallet.pointsBalance, wallet.rewardsTier)
  const usdcValue = wallet.pointsBalance / 100

  return (
    <div className="glass" style={{ padding: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
        <TierProgressRing wallet={wallet} />
        <div style={{ flex: 1 }}>
          <div className="font-mono" style={{ fontSize: 10, letterSpacing: '0.18em', color: 'var(--text-tertiary)', marginBottom: 4 }}>
            DUSTMILES BALANCE
          </div>
          <div className="font-display" style={{ fontSize: 28, fontWeight: 600, color: 'var(--gold)', letterSpacing: '-0.02em' }}>
            {formatPoints(wallet.pointsBalance)} pts
          </div>
          <div className="font-mono" style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
            ≈ {formatUSDC(usdcValue)} redeemable
          </div>
          {toNext && (
            <div className="font-mono" style={{ fontSize: 10, color: cfg.color, marginTop: 4 }}>
              {formatPoints(toNext)} pts to {getTierConfig(wallet.rewardsTier === 'SPARK' ? 'FLOW' : wallet.rewardsTier === 'FLOW' ? 'CURRENT' : wallet.rewardsTier === 'CURRENT' ? 'SURGE' : 'TSUNAMI').label}
            </div>
          )}
        </div>
      </div>

      {/* Earn sources today */}
      <div className="gold-divider" style={{ marginBottom: 12 }} />
      <div className="font-mono" style={{ fontSize: 10, letterSpacing: '0.12em', color: 'var(--text-tertiary)', marginBottom: 10 }}>
        EARNED TODAY
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        {[
          { source: 'Trading bot', pts: 5205, icon: '◉' },
          { source: 'Travel booking', pts: 150,  icon: '✈' },
          { source: 'Daily streak',  pts: 25,   icon: '🔥' },
        ].map(e => (
          <div key={e.source} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12 }}>{e.icon}</span>
            <span style={{ flex: 1, fontSize: 12, color: 'var(--text-secondary)' }}>{e.source}</span>
            <span className="font-mono" style={{ fontSize: 11, color: 'var(--gold-warm)', fontWeight: 500 }}>
              +{formatPoints(e.pts)}
            </span>
          </div>
        ))}
      </div>

      <Link href="/miles" style={{ textDecoration: 'none', display: 'block', marginTop: 14 }}>
        <button className="btn-sovereign" style={{ width: '100%', padding: '10px', fontSize: 12 }}>
          Redeem DustMiles
        </button>
      </Link>
    </div>
  )
}

// ── Transaction feed (enhanced) ───────────────────────────────
function RecentActivity({ txns }: { txns: Transaction[] }) {
  const typeIcons: Record<string, string> = {
    TRADE_BOT: '◉', TRAVEL_FLIGHT: '✈', TRAVEL_HOTEL: '🏨',
    USDC_SEND: '↗', USDC_RECEIVE: '↙', REFERRAL: '👥',
    CODE_DEPLOY: '◈', POINTS_REDEMPTION: '⬡', GAME_PURCHASE: '🎮',
  }
  const typeColors: Record<string, string> = {
    TRADE_BOT: 'var(--success)', TRAVEL_FLIGHT: '#7F77DD', TRAVEL_HOTEL: '#7F77DD',
    USDC_SEND: 'var(--danger)', USDC_RECEIVE: 'var(--success)', REFERRAL: 'var(--gold)',
    CODE_DEPLOY: '#00d4ff', POINTS_REDEMPTION: 'var(--gold)', GAME_PURCHASE: '#f472b6',
  }

  function timeAgo(iso: string) {
    const diff = Date.now() - new Date(iso).getTime()
    const m = Math.floor(diff / 60000)
    if (m < 1) return 'just now'
    if (m < 60) return `${m}m ago`
    const h = Math.floor(m / 60)
    if (h < 24) return `${h}h ago`
    return `${Math.floor(h / 24)}d ago`
  }

  return (
    <div className="glass" style={{ padding: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <span className="font-mono" style={{ fontSize: 10, letterSpacing: '0.18em', color: 'var(--text-tertiary)' }}>
          RECENT ACTIVITY
        </span>
        <Link href="/dashboard" style={{ textDecoration: 'none' }}>
          <span className="font-mono" style={{ fontSize: 10, color: 'var(--gold-dim)' }}>See all →</span>
        </Link>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {txns.slice(0, 6).map((tx, i) => {
          const icon = typeIcons[tx.type] ?? '◆'
          const color = typeColors[tx.type] ?? 'var(--text-tertiary)'
          const isCredit = ['USDC_RECEIVE', 'REFERRAL', 'POINTS_REDEMPTION'].includes(tx.type)

          return (
            <div key={tx.id} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '11px 0',
              borderBottom: i < txns.length - 1 ? '1px solid var(--border-void)' : 'none',
            }}>
              <div style={{
                width: 34, height: 34, borderRadius: 10, display: 'flex',
                alignItems: 'center', justifyContent: 'center', fontSize: 15,
                background: `${color}14`, border: `1px solid ${color}25`, flexShrink: 0,
                color,
              }}>
                {icon}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, color: 'var(--text-primary)', marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {tx.description}
                </div>
                <div className="font-mono" style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>
                  {timeAgo(tx.createdAt)}
                  {tx.pointsAwarded > 0 && (
                    <span style={{ color: 'var(--gold-warm)', marginLeft: 8 }}>+{tx.pointsAwarded} pts</span>
                  )}
                </div>
              </div>
              <div className="font-mono" style={{
                fontSize: 13, fontWeight: 500, flexShrink: 0,
                color: isCredit ? 'var(--success)' : 'var(--text-primary)',
              }}>
                {isCredit ? '+' : tx.amount > 0 ? '-' : ''}{formatUSDC(tx.amount)}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Main Dashboard ────────────────────────────────────────────
export default function DashboardEnhanced() {
  const wallet = MOCK_WALLET
  const user   = MOCK_USER
  const txns   = MOCK_TRANSACTIONS
  const positions = MOCK_POSITIONS

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {/* Page header */}
      <div style={{ marginBottom: 20 }}>
        <div className="font-mono" style={{ fontSize: 10, letterSpacing: '0.2em', color: 'var(--gold-warm)', textTransform: 'uppercase', marginBottom: 4 }}>
          Soul Wallet
        </div>
        <h1 className="font-display" style={{ fontSize: 30, fontWeight: 500, letterSpacing: '-0.025em', lineHeight: 1.1 }}>
          Sovereign Hub
        </h1>
      </div>

      {/* Market pulse */}
      <div style={{ overflowX: 'auto', marginBottom: 4 }}>
        <MarketPulse />
      </div>

      {/* Portfolio chart — always full width */}
      <PortfolioChart positions={positions} />

      {/* Two-column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 16, alignItems: 'start' }} className="dashboard-grid">

        {/* LEFT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Positions */}
          <div className="glass" style={{ padding: '20px 0' }}>
            <div style={{ padding: '0 20px', marginBottom: 12 }}>
              <div className="font-mono" style={{ fontSize: 10, letterSpacing: '0.18em', color: 'var(--text-tertiary)' }}>
                POSITIONS
              </div>
            </div>
            {positions.map(pos => <PositionRow key={pos.symbol} pos={pos} />)}
            <div style={{ padding: '12px 16px 0' }}>
              <Link href="/trade" style={{ textDecoration: 'none' }}>
                <button className="btn-glass" style={{ width: '100%', padding: '10px', fontSize: 13 }}>
                  View all positions + trading bot →
                </button>
              </Link>
            </div>
          </div>

          {/* Recent activity */}
          <RecentActivity txns={txns} />
        </div>

        {/* RIGHT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* DustMiles */}
          <DustMilesCard wallet={wallet} />

          {/* Bot live feed */}
          <BotLiveFeed />

          {/* Upcoming trip */}
          <UpcomingTrip />

          {/* Quick apps */}
          <div className="glass" style={{ padding: '18px 20px' }}>
            <div className="font-mono" style={{ fontSize: 10, letterSpacing: '0.18em', color: 'var(--text-tertiary)', marginBottom: 14 }}>
              QUICK ACCESS
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[
                { label: '✈ Travel',  href: '/travel', color: '#7F77DD' },
                { label: '◉ Trade',   href: '/trade',  color: 'var(--success)' },
                { label: '🎮 Gaming', href: '/gaming', color: '#f472b6' },
                { label: '◆ Vault',   href: '/vault',  color: 'var(--gold)' },
              ].map(a => (
                <Link key={a.href} href={a.href} style={{ textDecoration: 'none' }}>
                  <div style={{
                    padding: '12px', borderRadius: 10, textAlign: 'center', cursor: 'pointer',
                    background: 'var(--glass-1)', border: '1px solid var(--border-void)',
                    transition: 'all 0.15s', color: a.color, fontSize: 13, fontWeight: 500,
                  }}
                    onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = 'var(--glass-2)'; (e.currentTarget as HTMLDivElement).style.borderColor = `${a.color}30` }}
                    onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'var(--glass-1)'; (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border-void)' }}>
                    {a.label}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile responsive fix */}
      <style>{`
        @media (max-width: 900px) {
          .dashboard-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
