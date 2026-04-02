'use client'

import { useState } from 'react'
import { StatusBadge, Spinner } from '@/components/ui'
import {
  MOCK_BOT_CONFIG,
  MOCK_RECENT_TRADES,
  formatPrice,
  formatPnL,
  formatPct,
  pnlColor,
  type BotStatus,
  type Trade,
} from '@/lib/trade-data'

// ── Bot status indicator ───────────────────────────────────────

function BotStatusRing({ status }: { status: BotStatus }) {
  const color = status === 'ACTIVE' ? 'var(--success)' : status === 'PAUSED' ? 'var(--warning)' : 'var(--danger)'
  const label = status === 'ACTIVE' ? 'Active' : status === 'PAUSED' ? 'Paused' : 'Circuit breaker'

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ position: 'relative', width: 48, height: 48 }}>
        {/* Outer pulse */}
        {status === 'ACTIVE' && (
          <div
            style={{
              position: 'absolute',
              inset: -4,
              borderRadius: '50%',
              border: `1px solid ${color}`,
              opacity: 0.3,
              animation: 'pulseGold 2s ease-in-out infinite',
            }}
          />
        )}
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            background: `${color}15`,
            border: `2px solid ${color}40`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              width: 16,
              height: 16,
              borderRadius: '50%',
              background: color,
              boxShadow: `0 0 10px ${color}`,
            }}
          />
        </div>
      </div>
      <div>
        <div style={{ fontSize: 15, fontWeight: 500, color }}>{label}</div>
        <div className="font-mono" style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>
          Dust Trade Bot v2.1 · FREE
        </div>
      </div>
    </div>
  )
}

// ── Risk level slider ─────────────────────────────────────────

function RiskSelector({
  value,
  onChange,
}: {
  value: 'CONSERVATIVE' | 'MODERATE' | 'AGGRESSIVE'
  onChange: (v: 'CONSERVATIVE' | 'MODERATE' | 'AGGRESSIVE') => void
}) {
  const levels = ['CONSERVATIVE', 'MODERATE', 'AGGRESSIVE'] as const
  const colors = { CONSERVATIVE: 'var(--info)', MODERATE: 'var(--warning)', AGGRESSIVE: 'var(--danger)' }

  return (
    <div>
      <div className="font-mono" style={{ fontSize: 10, letterSpacing: '0.15em', color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: 10 }}>
        Risk level
      </div>
      <div
        style={{
          display: 'flex',
          gap: 4,
          padding: 4,
          background: 'var(--glass-2)',
          borderRadius: 10,
          border: '1px solid var(--border-gold-0)',
        }}
      >
        {levels.map(level => (
          <button
            key={level}
            onClick={() => onChange(level)}
            style={{
              flex: 1,
              padding: '8px',
              borderRadius: 7,
              border: `1px solid ${value === level ? colors[level] + '50' : 'transparent'}`,
              background: value === level ? colors[level] + '12' : 'transparent',
              color: value === level ? colors[level] : 'var(--text-tertiary)',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 10,
              letterSpacing: '0.06em',
              cursor: 'pointer',
              transition: 'all 0.15s',
              textTransform: 'capitalize',
            }}
          >
            {level.charAt(0) + level.slice(1).toLowerCase()}
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Trade row ─────────────────────────────────────────────────

function TradeRow({ trade }: { trade: Trade }) {
  const time = new Date(trade.executedAt).toLocaleTimeString('en-CA', { hour: '2-digit', minute: '2-digit' })
  const statusColor = {
    FILLED: 'var(--success)',
    PENDING: 'var(--warning)',
    CANCELLED: 'var(--text-tertiary)',
    PARTIAL: 'var(--info)',
  }[trade.status]

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '10px 0',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
      }}
    >
      {/* Side badge */}
      <div
        className="font-mono"
        style={{
          width: 36,
          textAlign: 'center',
          fontSize: 10,
          fontWeight: 700,
          padding: '3px 0',
          borderRadius: 6,
          background: trade.side === 'BUY' ? 'rgba(74,222,128,0.1)' : 'rgba(248,113,113,0.1)',
          color: trade.side === 'BUY' ? 'var(--success)' : 'var(--danger)',
          border: `1px solid ${trade.side === 'BUY' ? 'rgba(74,222,128,0.25)' : 'rgba(248,113,113,0.25)'}`,
          flexShrink: 0,
          letterSpacing: '0.05em',
        }}
      >
        {trade.side}
      </div>

      {/* Symbol + initiator */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 13, fontWeight: 500 }}>{trade.symbol}</span>
          <span
            className="font-mono"
            style={{
              fontSize: 9,
              padding: '1px 6px',
              borderRadius: 100,
              background: trade.initiatedBy === 'BOT' ? 'rgba(127,119,221,0.15)' : 'var(--glass-2)',
              color: trade.initiatedBy === 'BOT' ? '#AFA9EC' : 'var(--text-tertiary)',
            }}
          >
            {trade.initiatedBy === 'BOT' ? '◎ Bot' : '◉ You'}
          </span>
        </div>
        <div className="font-mono" style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>
          {trade.quantity} × {formatPrice(trade.price)} · {time}
          {trade.strategy && ` · ${trade.strategy}`}
        </div>
      </div>

      {/* Total */}
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>
          {formatPrice(trade.total)}
        </div>
        <div className="font-mono" style={{ fontSize: 10, color: statusColor }}>
          {trade.status.charAt(0) + trade.status.slice(1).toLowerCase()}
        </div>
      </div>
    </div>
  )
}

// ── Main Bot Dashboard ────────────────────────────────────────

export default function BotDashboard() {
  const [botStatus, setBotStatus] = useState<BotStatus>(MOCK_BOT_CONFIG.status)
  const [riskLevel, setRiskLevel] = useState(MOCK_BOT_CONFIG.riskLevel)
  const [maxPosition, setMaxPosition] = useState(MOCK_BOT_CONFIG.maxPositionSize)
  const [dailyLossLimit, setDailyLossLimit] = useState(MOCK_BOT_CONFIG.dailyLossLimit)
  const [toggling, setToggling] = useState(false)
  const bot = MOCK_BOT_CONFIG

  async function toggleBot() {
    setToggling(true)
    await new Promise(r => setTimeout(r, 800))
    setBotStatus(s => s === 'ACTIVE' ? 'PAUSED' : 'ACTIVE')
    setToggling(false)
  }

  return (
    <div className="animate-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Bot status card */}
      <div className="glass-heavy" style={{ padding: 28 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <BotStatusRing status={botStatus} />

            {/* Today's stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
              {[
                { label: 'Today\'s P&L', value: formatPnL(bot.dailyPnL), color: pnlColor(bot.dailyPnL) },
                { label: 'Trades today', value: String(bot.tradesToday), color: 'var(--text-primary)' },
                { label: 'Win rate', value: `${bot.winRate}%`, color: 'var(--success)' },
                { label: 'Avg return/trade', value: `+${bot.avgReturn}%`, color: 'var(--success)' },
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
                  <div className="font-mono" style={{ fontSize: 9, color: 'var(--text-tertiary)', letterSpacing: '0.1em', marginBottom: 5, textTransform: 'uppercase' }}>
                    {stat.label}
                  </div>
                  <div className="font-mono" style={{ fontSize: 16, fontWeight: 500, color: stat.color }}>
                    {stat.value}
                  </div>
                </div>
              ))}
            </div>

            {/* Active strategies */}
            <div>
              <div className="font-mono" style={{ fontSize: 10, letterSpacing: '0.15em', color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: 8 }}>
                Active strategies
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {bot.activeStrategies.map(s => (
                  <span
                    key={s}
                    className="font-mono"
                    style={{
                      fontSize: 11,
                      padding: '4px 12px',
                      borderRadius: 100,
                      background: 'rgba(127,119,221,0.1)',
                      border: '1px solid rgba(127,119,221,0.25)',
                      color: '#AFA9EC',
                    }}
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Controls */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minWidth: 240 }}>

            {/* Toggle */}
            <button
              onClick={toggleBot}
              disabled={toggling}
              style={{
                padding: '12px 20px',
                borderRadius: 12,
                border: `1px solid ${botStatus === 'ACTIVE' ? 'rgba(248,113,113,0.3)' : 'rgba(74,222,128,0.3)'}`,
                background: botStatus === 'ACTIVE' ? 'rgba(248,113,113,0.08)' : 'rgba(74,222,128,0.08)',
                color: botStatus === 'ACTIVE' ? 'var(--danger)' : 'var(--success)',
                fontFamily: "'Geist', system-ui, sans-serif",
                fontSize: 14,
                cursor: toggling ? 'wait' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                transition: 'all 0.2s',
              }}
            >
              {toggling
                ? <><Spinner size={16} color="currentColor" />Updating…</>
                : botStatus === 'ACTIVE' ? '⏸ Pause bot' : '▶ Resume bot'
              }
            </button>

            {/* Risk level */}
            <RiskSelector value={riskLevel} onChange={setRiskLevel} />

            {/* Limits */}
            {[
              { label: 'Max position size', value: maxPosition, set: setMaxPosition, suffix: '% of portfolio', min: 1, max: 20 },
              { label: 'Daily loss limit', value: dailyLossLimit, set: setDailyLossLimit, suffix: '% of portfolio', min: 1, max: 10 },
            ].map(cfg => (
              <div key={cfg.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span className="font-mono" style={{ fontSize: 10, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    {cfg.label}
                  </span>
                  <span className="font-mono" style={{ fontSize: 11, color: 'var(--gold-warm)', fontWeight: 500 }}>
                    {cfg.value}%
                  </span>
                </div>
                <input
                  type="range"
                  min={cfg.min}
                  max={cfg.max}
                  value={cfg.value}
                  onChange={e => cfg.set(parseInt(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--gold)' }}
                />
                <div className="font-mono" style={{ fontSize: 9, color: 'var(--text-tertiary)', marginTop: 2 }}>
                  {cfg.suffix}
                </div>
              </div>
            ))}

            {/* Revenue model transparency */}
            <div
              style={{
                padding: '10px 12px',
                background: 'var(--glass-1)',
                border: '1px solid var(--border-gold-0)',
                borderRadius: 10,
              }}
            >
              <div className="font-mono" style={{ fontSize: 10, color: 'var(--gold-warm)', marginBottom: 4, letterSpacing: '0.08em' }}>
                HOW DUST TRADE IS FREE
              </div>
              <div className="font-mono" style={{ fontSize: 10, color: 'var(--text-tertiary)', lineHeight: 1.6 }}>
                We capture 0.10% on trade volume — invisible to you, never added to your price. You pay $0 in subscription fees. Ever.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent trades */}
      <div className="glass" style={{ padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div className="font-display" style={{ fontSize: 16, fontWeight: 500 }}>Recent trades</div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span className="font-mono" style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
              {bot.totalTrades.toLocaleString()} total
            </span>
            <button className="btn-ghost" style={{ padding: '5px 12px', fontSize: 12 }}>Export CSV</button>
          </div>
        </div>
        {MOCK_RECENT_TRADES.map(trade => (
          <TradeRow key={trade.id} trade={trade} />
        ))}
      </div>
    </div>
  )
}
