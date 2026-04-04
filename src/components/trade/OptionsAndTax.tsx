'use client'

import { useState } from 'react'
import { StatusBadge, Spinner } from '@/components/ui'
import type { OptionsStrategy } from '@/lib/trade-data'
import {
  MOCK_OPTIONS_POSITIONS,
  MOCK_TAX_LOSS_ITEMS,
  formatPrice,
  formatPnL,
  formatPct,
  pnlColor,
  strategyLabel,
  type OptionsPosition,
  type TaxLossItem,
} from '@/lib/trade-data'

// ============================================================
// OPTIONS PANEL
// ============================================================

const STRATEGY_EXPLANATIONS = {
  COVERED_CALL: 'You own the stock and sell a call above market price. You collect premium income. If the stock rises past the strike, shares get called away at a profit.',
  IRON_CONDOR: 'Sell an OTM put spread and an OTM call spread simultaneously. You profit when the underlying stays between your short strikes. Max profit = net premium collected.',
  STRADDLE: 'Buy both a call and put at the same strike. You profit from large moves in either direction. Works best before earnings announcements or major events.',
  PROTECTIVE_PUT: 'Buy a put below your stock position to cap downside. Acts like insurance — you pay a premium for protection against sharp declines.',
  CASH_SECURED_PUT: 'Sell a put on a stock you want to own at a lower price. If assigned, you buy at the strike. If not, you keep the premium.',
}

function GreekBadge({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div className="font-mono" style={{ fontSize: 9, color: 'var(--text-tertiary)', letterSpacing: '0.1em', marginBottom: 3 }}>
        {label}
      </div>
      <div
        className="font-mono"
        style={{
          fontSize: 12,
          fontWeight: 500,
          color: label === 'THETA' ? 'var(--success)' : label === 'DELTA' ? 'var(--info)' : 'var(--text-secondary)',
        }}
      >
        {value >= 0 ? '+' : ''}{value.toFixed(3)}
      </div>
    </div>
  )
}

function OptionsCard({ pos }: { pos: OptionsPosition }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div
      style={{
        background: 'var(--glass-1)',
        border: '1px solid var(--border-gold-1)',
        borderRadius: 14,
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '16px 20px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          flexWrap: 'wrap',
        }}
        onClick={() => setExpanded(e => !e)}
      >
        {/* Strategy badge */}
        <div
          className="font-mono"
          style={{
            fontSize: 10,
            padding: '4px 12px',
            borderRadius: 100,
            background: 'rgba(127,119,221,0.12)',
            border: '1px solid rgba(127,119,221,0.3)',
            color: '#AFA9EC',
            letterSpacing: '0.06em',
            flexShrink: 0,
          }}
        >
          {strategyLabel(pos.strategy).toUpperCase()}
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 2 }}>
            {pos.symbol} · {pos.daysToExpiry} DTE
          </div>
          <div className="font-mono" style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>
            {pos.legs.length} leg{pos.legs.length > 1 ? 's' : ''} · Breakeven: {pos.breakeven.map(b => formatPrice(b)).join(' / ')}
          </div>
        </div>

        {/* P&L */}
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div className="font-mono" style={{ fontSize: 14, fontWeight: 500, color: pnlColor(pos.unrealizedPnL) }}>
            {formatPnL(pos.unrealizedPnL)}
          </div>
          <div className="font-mono" style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>
            Max profit: {formatPrice(pos.maxProfit)} · Max loss: {pos.maxLoss === -Infinity ? '∞' : formatPrice(Math.abs(pos.maxLoss))}
          </div>
        </div>

        {/* Expand arrow */}
        <svg
          width="14" height="14" viewBox="0 0 14 14" fill="none"
          style={{ transition: 'transform 0.2s', transform: expanded ? 'rotate(180deg)' : 'rotate(0)', flexShrink: 0 }}
        >
          <path d="M2 5l5 4 5-4" stroke="var(--text-tertiary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div style={{ padding: '0 20px 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="gold-divider" />

          {/* Strategy explanation */}
          <div
            style={{
              padding: '10px 14px',
              background: 'var(--glass-2)',
              borderRadius: 10,
              fontSize: 12,
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
              borderLeft: '2px solid rgba(127,119,221,0.4)',
            }}
          >
            {STRATEGY_EXPLANATIONS[pos.strategy]}
          </div>

          {/* Legs table */}
          <div>
            <div className="font-mono" style={{ fontSize: 10, letterSpacing: '0.12em', color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: 8 }}>
              Legs
            </div>
            {pos.legs.map((leg, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  gap: 12,
                  padding: '8px 0',
                  borderBottom: i < pos.legs.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                  alignItems: 'center',
                }}
              >
                <span
                  className="font-mono"
                  style={{
                    fontSize: 10,
                    padding: '2px 8px',
                    borderRadius: 100,
                    background: leg.action === 'SELL' ? 'rgba(248,113,113,0.1)' : 'rgba(74,222,128,0.1)',
                    color: leg.action === 'SELL' ? 'var(--danger)' : 'var(--success)',
                    border: `1px solid ${leg.action === 'SELL' ? 'rgba(248,113,113,0.25)' : 'rgba(74,222,128,0.25)'}`,
                  }}
                >
                  {leg.action} {leg.type}
                </span>
                <span className="font-mono" style={{ fontSize: 12, color: 'var(--text-primary)' }}>
                  {pos.symbol} {formatPrice(leg.strike)} {leg.expiry}
                </span>
                <span className="font-mono" style={{ fontSize: 11, color: 'var(--text-tertiary)', marginLeft: 'auto' }}>
                  {leg.contracts} contract{leg.contracts > 1 ? 's' : ''} · {formatPrice(leg.premium)}/share
                </span>
              </div>
            ))}
          </div>

          {/* Greeks */}
          <div>
            <div className="font-mono" style={{ fontSize: 10, letterSpacing: '0.12em', color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: 8 }}>
              Greeks
            </div>
            <div
              style={{
                display: 'flex',
                gap: 16,
                padding: '12px 16px',
                background: 'var(--glass-2)',
                border: '1px solid var(--border-void)',
                borderRadius: 10,
              }}
            >
              <GreekBadge label="DELTA" value={pos.greeks.delta} />
              <GreekBadge label="THETA" value={pos.greeks.theta} />
              <GreekBadge label="VEGA" value={pos.greeks.vega} />
              <GreekBadge label="GAMMA" value={pos.greeks.gamma} />
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn-glass" style={{ flex: 1, padding: '9px', fontSize: 12 }}>Roll forward</button>
            <button className="btn-glass" style={{ flex: 1, padding: '9px', fontSize: 12 }}>Adjust strikes</button>
            <button
              className="btn-glass"
              style={{ flex: 1, padding: '9px', fontSize: 12, color: 'var(--danger)', borderColor: 'rgba(248,113,113,0.25)' }}
            >
              Close position
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export function OptionsPanel() {
  const [showNewStrategy, setShowNewStrategy] = useState(false)

  return (
    <div className="animate-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
        <div>
          <div className="font-display" style={{ fontSize: 16, fontWeight: 500, marginBottom: 2 }}>Options positions</div>
          <div className="font-mono" style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
            Click any position to see legs, Greeks, and management actions
          </div>
        </div>
        <button
          className="btn-sovereign"
          style={{ padding: '9px 18px', fontSize: 13 }}
          onClick={() => setShowNewStrategy(s => !s)}
        >
          + New strategy
        </button>
      </div>

      {MOCK_OPTIONS_POSITIONS.map(pos => (
        <OptionsCard key={pos.id} pos={pos} />
      ))}

      {/* Strategy selector */}
      {showNewStrategy && (
        <div
          className="glass"
          style={{ padding: 20 }}
        >
          <div className="font-mono" style={{ fontSize: 10, letterSpacing: '0.15em', color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: 14 }}>
            Select a strategy
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
            {Object.entries(STRATEGY_EXPLANATIONS).map(([key, desc]) => (
              <div
                key={key}
                style={{
                  padding: '12px 14px',
                  background: 'var(--glass-2)',
                  border: '1px solid var(--border-gold-0)',
                  borderRadius: 10,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'var(--border-gold-2)'
                  e.currentTarget.style.background = 'var(--gold-glass-1)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--border-gold-0)'
                  e.currentTarget.style.background = 'var(--glass-2)'
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 4 }}>
                  {strategyLabel(key as OptionsStrategy)}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)', lineHeight: 1.5 }}>
                  {desc.split('.')[0]}.
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================================
// TAX-LOSS HARVESTING
// ============================================================

function TaxLossCard({ item }: { item: TaxLossItem }) {
  const [harvesting, setHarvesting] = useState(false)
  const [harvested, setHarvested] = useState(false)

  async function handleHarvest() {
    setHarvesting(true)
    await new Promise(r => setTimeout(r, 1500))
    setHarvesting(false)
    setHarvested(true)
  }

  return (
    <div
      style={{
        padding: '16px 18px',
        background: 'var(--glass-1)',
        border: `1px solid ${item.washSaleRisk ? 'rgba(251,191,36,0.2)' : 'var(--border-gold-0)'}`,
        borderRadius: 14,
        opacity: harvested ? 0.5 : 1,
        transition: 'opacity 0.3s',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span style={{ fontSize: 14, fontWeight: 500 }}>{item.symbol}</span>
            <span
              className="font-mono"
              style={{
                fontSize: 9,
                padding: '1px 7px',
                borderRadius: 100,
                background: 'var(--glass-2)',
                color: 'var(--text-tertiary)',
              }}
            >
              {item.assetClass}
            </span>
            {item.washSaleRisk && (
              <StatusBadge variant="warning">Wash sale risk</StatusBadge>
            )}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 8 }}>
            {item.suggestion}
          </div>
        </div>

        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div className="font-mono" style={{ fontSize: 14, fontWeight: 500, color: 'var(--danger)', marginBottom: 2 }}>
            {formatPnL(item.unrealizedLoss)}
          </div>
          <div style={{ fontSize: 12, color: 'var(--success)', marginBottom: 10 }}>
            Save {formatPrice(item.harvestSaving)} tax
          </div>
          <button
            className={harvested ? 'btn-ghost' : item.washSaleRisk ? 'btn-glass' : 'btn-sovereign'}
            style={{
              padding: '7px 14px',
              fontSize: 12,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              opacity: item.washSaleRisk && !harvested ? 0.6 : 1,
            }}
            onClick={handleHarvest}
            disabled={harvesting || harvested || item.washSaleRisk}
          >
            {harvesting
              ? <><Spinner size={12} color="#000" />Harvesting…</>
              : harvested ? '✓ Harvested'
              : item.washSaleRisk ? 'Wait 12 days'
              : 'Harvest loss'
            }
          </button>
        </div>
      </div>
    </div>
  )
}

export function TaxLossHarvesting() {
  const totalLoss = MOCK_TAX_LOSS_ITEMS.reduce((sum, i) => sum + i.unrealizedLoss, 0)
  const totalSaving = MOCK_TAX_LOSS_ITEMS.reduce((sum, i) => sum + i.harvestSaving, 0)

  return (
    <div className="animate-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Summary */}
      <div
        style={{
          display: 'flex',
          gap: 12,
          padding: '16px 20px',
          background: 'var(--glass-2)',
          border: '1px solid var(--border-gold-1)',
          borderRadius: 14,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ flex: 1 }}>
          <div className="font-mono" style={{ fontSize: 10, color: 'var(--text-tertiary)', marginBottom: 4 }}>HARVESTABLE LOSSES</div>
          <div className="font-display" style={{ fontSize: 24, color: 'var(--danger)' }}>{formatPnL(totalLoss)}</div>
        </div>
        <div style={{ flex: 1 }}>
          <div className="font-mono" style={{ fontSize: 10, color: 'var(--text-tertiary)', marginBottom: 4 }}>ESTIMATED TAX SAVING</div>
          <div className="font-display" style={{ fontSize: 24, color: 'var(--success)' }}>+{formatPrice(totalSaving)}</div>
        </div>
        <div style={{ flex: 1 }}>
          <div className="font-mono" style={{ fontSize: 10, color: 'var(--text-tertiary)', marginBottom: 4 }}>ASSUMED TAX RATE</div>
          <div className="font-display" style={{ fontSize: 24, color: 'var(--text-primary)' }}>~25%</div>
        </div>
        <div
          style={{
            padding: '12px 14px',
            background: 'var(--glass-1)',
            border: '1px solid var(--border-gold-0)',
            borderRadius: 10,
            flex: 2,
          }}
        >
          <div className="font-mono" style={{ fontSize: 10, color: 'var(--gold-warm)', marginBottom: 4 }}>HOW IT WORKS</div>
          <div className="font-mono" style={{ fontSize: 10, color: 'var(--text-tertiary)', lineHeight: 1.6 }}>
            Sell positions at a loss to offset capital gains. Immediately rebuy a similar (not identical) asset to maintain market exposure. Canada has no wash-sale rules for crypto.
          </div>
        </div>
      </div>

      {MOCK_TAX_LOSS_ITEMS.map(item => (
        <TaxLossCard key={item.symbol} item={item} />
      ))}
    </div>
  )
}

export default OptionsPanel
