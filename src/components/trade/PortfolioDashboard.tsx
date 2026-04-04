'use client'

import { useState } from 'react'
import { StatusBadge } from '@/components/ui'
import {
  MOCK_PORTFOLIO_STATS,
  MOCK_POSITIONS,
  MOCK_MARKET_OVERVIEW,
  formatPrice,
  formatPnL,
  formatPct,
  pnlColor,
  type Position,
  type AssetClass,
} from '@/lib/trade-data'

// ── Mini sparkline (pure SVG) ─────────────────────────────────

function Sparkline({ positive, width = 80, height = 28 }: { positive: boolean; width?: number; height?: number }) {
  // Generate a simple upward or downward trending line
  const points = positive
    ? [0,22,18,14,20,10,8,12,4,0].map((y, x) => `${x * (width / 9)},${y}`)
    : [0,4,8,6,12,10,16,14,20,24].map((y, x) => `${x * (width / 9)},${y}`)

  const color = positive ? 'var(--success)' : 'var(--danger)'
  const pathD = `M ${points.join(' L ')}`

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <path d={pathD} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.7" />
    </svg>
  )
}

// ── Allocation donut (SVG) ────────────────────────────────────

function AllocationDonut({ positions }: { positions: Position[] }) {
  const colors = ['#F7931A', '#627EEA', '#76B900', '#00A4EF', '#D4AF37']
  let cumulative = 0
  const cx = 60, cy = 60, r = 48, stroke = 16

  const segments = positions.map((p, i) => {
    const pct = p.allocation / 100
    const dashArray = `${pct * 2 * Math.PI * r} ${2 * Math.PI * r}`
    const rotate = cumulative * 360 - 90
    cumulative += pct
    return { dashArray, rotate, color: colors[i % colors.length], label: p.symbol, pct: p.allocation }
  })

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
      <svg width={120} height={120} viewBox="0 0 120 120">
        {/* Background circle */}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--glass-2)" strokeWidth={stroke} />
        {segments.map((seg, i) => (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={seg.color}
            strokeWidth={stroke}
            strokeDasharray={seg.dashArray}
            strokeLinecap="butt"
            transform={`rotate(${seg.rotate} ${cx} ${cy})`}
            opacity={0.85}
          />
        ))}
        {/* Cash */}
        <text x={cx} y={cy - 4} textAnchor="middle" fontSize="10" fill="var(--text-tertiary)" fontFamily="var(--font-mono)">CASH</text>
        <text x={cx} y={cy + 10} textAnchor="middle" fontSize="13" fill="var(--gold)" fontFamily="var(--font-mono)" fontWeight="500">
          {((MOCK_PORTFOLIO_STATS.cashBalance / MOCK_PORTFOLIO_STATS.totalValue) * 100).toFixed(1)}%
        </text>
      </svg>

      {/* Legend */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        {segments.map((seg, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: seg.color, flexShrink: 0 }} />
            <span className="font-mono" style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
              {seg.label}
            </span>
            <span className="font-mono" style={{ fontSize: 11, color: 'var(--text-tertiary)', marginLeft: 'auto', minWidth: 36, textAlign: 'right' }}>
              {seg.pct.toFixed(1)}%
            </span>
          </div>
        ))}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--gold-dim)', flexShrink: 0 }} />
          <span className="font-mono" style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Cash</span>
          <span className="font-mono" style={{ fontSize: 11, color: 'var(--text-tertiary)', marginLeft: 'auto', minWidth: 36, textAlign: 'right' }}>
            {((MOCK_PORTFOLIO_STATS.cashBalance / MOCK_PORTFOLIO_STATS.totalValue) * 100).toFixed(1)}%
          </span>
        </div>
      </div>
    </div>
  )
}

// ── Market ticker ─────────────────────────────────────────────

function MarketTicker() {
  return (
    <div
      style={{
        display: 'flex',
        gap: 20,
        overflowX: 'auto',
        padding: '10px 16px',
        background: 'var(--glass-2)',
        border: '1px solid var(--border-gold-0)',
        borderRadius: 10,
        marginBottom: 16,
      }}
    >
      {MOCK_MARKET_OVERVIEW.map(m => (
        <div key={m.symbol} style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <div
            style={{
              width: 24,
              height: 24,
              borderRadius: 6,
              background: m.logoColor + '22',
              border: `1px solid ${m.logoColor}44`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: m.logoColor }} />
          </div>
          <div>
            <div className="font-mono" style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-primary)', lineHeight: 1 }}>
              {m.symbol}
            </div>
            <div className="font-mono" style={{ fontSize: 10, color: pnlColor(m.changePct) }}>
              {formatPct(m.changePct)}
            </div>
          </div>
          <div className="font-mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            {m.symbol.includes('/') ? m.price.toFixed(4) : formatPrice(m.price, m.price > 100 ? 2 : 2)}
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Position row ──────────────────────────────────────────────

function PositionRow({ pos }: { pos: Position }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '12px 0',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
      }}
    >
      {/* Logo */}
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          background: pos.logoColor + '18',
          border: `1px solid ${pos.logoColor}30`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: pos.logoColor }} />
      </div>

      {/* Name + class */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{pos.symbol}</div>
        <div className="font-mono" style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>
          {pos.name} · {pos.assetClass}
        </div>
      </div>

      {/* Sparkline */}
      <div style={{ flexShrink: 0 }}>
        <Sparkline positive={pos.dayChangePct >= 0} />
      </div>

      {/* Day change */}
      <div style={{ textAlign: 'right', minWidth: 70, flexShrink: 0 }}>
        <div className="font-mono" style={{ fontSize: 12, color: pnlColor(pos.dayChangePct), fontWeight: 500 }}>
          {formatPct(pos.dayChangePct)}
        </div>
        <div className="font-mono" style={{ fontSize: 10, color: pnlColor(pos.dayChange) }}>
          {formatPnL(pos.dayChange)}
        </div>
      </div>

      {/* Market value */}
      <div style={{ textAlign: 'right', minWidth: 80, flexShrink: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>
          {formatPrice(pos.marketValue)}
        </div>
        <div className="font-mono" style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>
          {pos.allocation.toFixed(1)}% of port.
        </div>
      </div>

      {/* Total P&L */}
      <div style={{ textAlign: 'right', minWidth: 80, flexShrink: 0 }}>
        <div className="font-mono" style={{ fontSize: 12, color: pnlColor(pos.unrealizedPnL), fontWeight: 500 }}>
          {formatPnL(pos.unrealizedPnL)}
        </div>
        <div className="font-mono" style={{ fontSize: 10, color: pnlColor(pos.unrealizedPnLPct) }}>
          {formatPct(pos.unrealizedPnLPct)}
        </div>
      </div>
    </div>
  )
}

// ── Main Portfolio Dashboard ──────────────────────────────────

export default function PortfolioDashboard() {
  const s = MOCK_PORTFOLIO_STATS

  return (
    <div className="animate-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Market ticker */}
      <MarketTicker />

      {/* Total value hero */}
      <div
        className="glass-heavy"
        style={{ padding: 28, position: 'relative', overflow: 'hidden' }}
      >
        <div
          style={{
            position: 'absolute',
            top: -40, right: -40,
            width: 200, height: 200,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(212,175,55,0.07) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 32, flexWrap: 'wrap' }}>
          {/* Total value */}
          <div style={{ flex: 1 }}>
            <div className="font-mono" style={{ fontSize: 10, letterSpacing: '0.18em', color: 'var(--text-tertiary)', marginBottom: 8, textTransform: 'uppercase' }}>
              Total portfolio value
            </div>
            <div className="font-display" style={{ fontSize: 48, fontWeight: 600, color: 'var(--gold)', letterSpacing: '-0.03em', lineHeight: 1 }}>
              {formatPrice(s.totalValue)}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10 }}>
              <span className="font-mono" style={{ fontSize: 14, color: pnlColor(s.dayPnL), fontWeight: 500 }}>
                {formatPnL(s.dayPnL)} today
              </span>
              <span
                className="font-mono"
                style={{
                  fontSize: 12,
                  padding: '2px 10px',
                  borderRadius: 100,
                  background: s.dayPnLPct >= 0 ? 'rgba(74,222,128,0.1)' : 'rgba(248,113,113,0.1)',
                  color: pnlColor(s.dayPnLPct),
                  border: `1px solid ${s.dayPnLPct >= 0 ? 'rgba(74,222,128,0.25)' : 'rgba(248,113,113,0.25)'}`,
                }}
              >
                {formatPct(s.dayPnLPct)}
              </span>
            </div>
          </div>

          {/* Stats grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(100px,1fr))', gap: 12 }}>
            {[
              { label: 'Total return', value: formatPnL(s.totalPnL), sub: formatPct(s.totalPnLPct), color: pnlColor(s.totalPnL) },
              { label: 'Invested', value: formatPrice(s.investedValue), sub: 'in positions', color: 'var(--text-primary)' },
              { label: 'Cash', value: formatPrice(s.cashBalance), sub: 'available', color: 'var(--text-primary)' },
            ].map(stat => (
              <div
                key={stat.label}
                style={{
                  padding: '12px',
                  background: 'var(--glass-2)',
                  border: '1px solid var(--border-void)',
                  borderRadius: 10,
                }}
              >
                <div className="font-mono" style={{ fontSize: 9, color: 'var(--text-tertiary)', letterSpacing: '0.12em', marginBottom: 6, textTransform: 'uppercase' }}>
                  {stat.label}
                </div>
                <div style={{ fontSize: 15, fontWeight: 500, color: stat.color, marginBottom: 2 }}>
                  {stat.value}
                </div>
                <div className="font-mono" style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>
                  {stat.sub}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Positions + allocation */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 16, alignItems: 'start' }}>

        {/* Positions table */}
        <div className="glass" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div className="font-display" style={{ fontSize: 16, fontWeight: 500 }}>
              Positions
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <StatusBadge variant="success" pulse>Market open</StatusBadge>
              <button className="btn-ghost" style={{ padding: '5px 12px', fontSize: 12 }}>+ Add position</button>
            </div>
          </div>

          {/* Table header */}
          <div
            style={{
              display: 'flex',
              gap: 12,
              padding: '0 0 8px',
              borderBottom: '1px solid var(--border-gold-0)',
            }}
          >
            {['Asset', '', 'Today', 'Value', 'Total P&L'].map((h, i) => (
              <div
                key={i}
                className="font-mono"
                style={{
                  fontSize: 9,
                  color: 'var(--text-tertiary)',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  flex: i === 1 ? 1 : 0,
                  minWidth: i === 0 ? 36 + 60 : i === 2 ? 80 : i === 3 ? 80 : i === 4 ? 80 : 'auto',
                  textAlign: i >= 2 ? 'right' : 'left',
                }}
              >
                {h}
              </div>
            ))}
          </div>

          {MOCK_POSITIONS.map(pos => (
            <PositionRow key={pos.id} pos={pos} />
          ))}
        </div>

        {/* Allocation donut */}
        <div className="glass" style={{ padding: 24, minWidth: 240 }}>
          <div className="font-display" style={{ fontSize: 16, fontWeight: 500, marginBottom: 16 }}>
            Allocation
          </div>
          <AllocationDonut positions={MOCK_POSITIONS} />
        </div>
      </div>
    </div>
  )
}
