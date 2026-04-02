'use client'

import { formatUSDC } from '@/types'
import type { TradingBotConfig } from '@/types'

interface BotStatusWidgetProps {
  config: TradingBotConfig
  tradesToday: number
  pnlToday: number
  feesToday: number
}

export default function BotStatusWidget({
  config,
  tradesToday,
  pnlToday,
  feesToday,
}: BotStatusWidgetProps) {
  const pnlPositive = pnlToday >= 0

  return (
    <div className="glass animate-fade-up delay-3" style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <div className="font-display" style={{ fontSize: 18, fontWeight: 500 }}>
            Trading bot
          </div>
          <div
            className="font-mono"
            style={{ fontSize: 10, color: 'var(--text-tertiary)', letterSpacing: '0.1em', marginTop: 2 }}
          >
            FREE · 0.10% per trade
          </div>
        </div>

        {/* Status toggle indicator */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 14px',
            background: config.isActive ? 'rgba(74,222,128,0.08)' : 'var(--glass-2)',
            border: `1px solid ${config.isActive ? 'rgba(74,222,128,0.25)' : 'var(--border-gold-0)'}`,
            borderRadius: 100,
          }}
        >
          <div
            style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: config.isActive ? 'var(--success)' : 'var(--text-tertiary)',
              boxShadow: config.isActive ? '0 0 8px var(--success)' : 'none',
              animation: config.isActive ? 'pulseGold 1.5s ease-in-out infinite' : 'none',
            }}
          />
          <span
            className="font-mono"
            style={{
              fontSize: 11,
              letterSpacing: '0.08em',
              color: config.isActive ? 'var(--success)' : 'var(--text-tertiary)',
            }}
          >
            {config.isActive ? 'RUNNING' : 'PAUSED'}
          </span>
        </div>
      </div>

      {/* Stats grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 10,
          marginBottom: 20,
        }}
      >
        <div
          style={{
            padding: '14px',
            background: 'var(--glass-2)',
            border: '1px solid var(--border-gold-0)',
            borderRadius: 12,
          }}
        >
          <div className="font-mono" style={{ fontSize: 10, color: 'var(--text-tertiary)', marginBottom: 6, letterSpacing: '0.1em' }}>
            TRADES TODAY
          </div>
          <div className="font-display" style={{ fontSize: 28, fontWeight: 600, color: 'var(--gold)', letterSpacing: '-0.02em', lineHeight: 1 }}>
            {tradesToday.toLocaleString()}
          </div>
        </div>

        <div
          style={{
            padding: '14px',
            background: 'var(--glass-2)',
            border: '1px solid var(--border-gold-0)',
            borderRadius: 12,
          }}
        >
          <div className="font-mono" style={{ fontSize: 10, color: 'var(--text-tertiary)', marginBottom: 6, letterSpacing: '0.1em' }}>
            P&L TODAY
          </div>
          <div
            className="font-display"
            style={{
              fontSize: 28,
              fontWeight: 600,
              color: pnlPositive ? 'var(--success)' : 'var(--danger)',
              letterSpacing: '-0.02em',
              lineHeight: 1,
            }}
          >
            {pnlPositive ? '+' : ''}{formatUSDC(pnlToday)}
          </div>
        </div>
      </div>

      {/* Strategy tags */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 20 }}>
        {config.assetClasses.map((cls) => (
          <span
            key={cls}
            className="font-mono"
            style={{
              fontSize: 10,
              padding: '3px 10px',
              borderRadius: 100,
              background: 'var(--gold-glass-1)',
              border: '1px solid var(--border-gold-0)',
              color: 'var(--gold-warm)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase' as const,
            }}
          >
            {cls}
          </span>
        ))}
        <span
          className="font-mono"
          style={{
            fontSize: 10,
            padding: '3px 10px',
            borderRadius: 100,
            background: 'var(--glass-2)',
            border: '1px solid var(--border-void)',
            color: 'var(--text-tertiary)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase' as const,
          }}
        >
          {config.riskTolerance}
        </span>
      </div>

      {/* Divider */}
      <div className="gold-divider" style={{ marginBottom: 16 }} />

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          className="btn-glass"
          style={{ flex: 1, padding: '10px', fontSize: 13 }}
        >
          Configure
        </button>
        <button
          className={config.isActive ? 'btn-ghost' : 'btn-sovereign'}
          style={{ flex: 1, padding: '10px', fontSize: 13 }}
        >
          {config.isActive ? 'Pause bot' : 'Start bot'}
        </button>
      </div>
    </div>
  )
}
