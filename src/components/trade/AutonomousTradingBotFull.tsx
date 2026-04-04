'use client'
// ============================================================
// DUST TRADE — Complete Hub (Bot + Phantom Flow™ + All Features)
// ============================================================

import { useState, useEffect } from 'react'
import { StatusBadge, Spinner } from '@/components/ui'
import { PortfolioDashboard } from './PortfolioDashboard'
import { BotDashboard } from './BotDashboard'
import AutonomousTradingBot from './AutonomousTradingBot'
import PhantomFlowStrategy from './PhantomFlowStrategy'

type HubTab = 'bot' | 'phantom' | 'portfolio' | 'backtest' | 'journal'

export default function AutonomousTradingBotFull() {
  const [tab, setTab] = useState<HubTab>('bot')

  const TABS = [
    { id: 'bot'       as HubTab, label: '◆ Bot Hub',         badge: 'FREE',   desc: 'Autonomous multi-strategy trading bot' },
    { id: 'phantom'   as HubTab, label: '⚡ Phantom Flow™',  badge: 'NEW',    desc: 'Our proprietary 84.2% win rate strategy' },
    { id: 'portfolio' as HubTab, label: '◎ Portfolio',        badge: null,     desc: 'View all positions and P&L' },
    { id: 'journal'   as HubTab, label: '◉ Journal',          badge: null,     desc: 'Trade-by-trade performance log' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div>
        <div className="font-mono" style={{ fontSize: 10, letterSpacing: '0.2em', color: 'var(--gold-warm)', marginBottom: 4 }}>DUST TRADE</div>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <h1 className="font-display" style={{ fontSize: 30, fontWeight: 500, letterSpacing: '-0.025em' }}>
            Trading Hub
          </h1>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', paddingBottom: 4 }}>
            <StatusBadge variant="gold">Phantom Flow™ 84.2% win rate</StatusBadge>
            <StatusBadge variant="success">Bot always FREE</StatusBadge>
            <StatusBadge variant="info">+15 DM/trade</StatusBadge>
          </div>
        </div>
      </div>

      {/* Tab selector */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: '14px 12px', borderRadius: 12, border: 'none', cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left',
            background: tab === t.id ? 'var(--gold-glass-2)' : 'var(--glass-1)',
            border: `1px solid ${tab === t.id ? 'var(--border-gold-2)' : 'var(--border-gold-0)'}`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span className="font-mono" style={{ fontSize: 12, color: tab === t.id ? 'var(--gold)' : 'var(--text-secondary)', fontWeight: tab === t.id ? 600 : 400 }}>
                {t.label}
              </span>
              {t.badge && (
                <span className="font-mono" style={{ fontSize: 8, padding: '1px 6px', borderRadius: 100, background: t.badge === 'FREE' ? 'rgba(74,222,128,0.1)' : t.badge === 'NEW' ? 'var(--gold-glass-2)' : 'var(--glass-2)', color: t.badge === 'FREE' ? 'var(--success)' : 'var(--gold)', fontWeight: 600 }}>
                  {t.badge}
                </span>
              )}
            </div>
            <div className="font-mono" style={{ fontSize: 9, color: 'var(--text-tertiary)', lineHeight: 1.4 }}>{t.desc}</div>
          </button>
        ))}
      </div>

      {/* Content */}
      {tab === 'bot'       && <AutonomousTradingBot />}
      {tab === 'phantom'   && <PhantomFlowStrategy />}
      {tab === 'portfolio' && <PortfolioDashboard />}
      {tab === 'journal'   && (
        <div className="glass" style={{ padding: 24, textAlign: 'center' }}>
          <div className="font-display" style={{ fontSize: 18, marginBottom: 8 }}>Trading Journal</div>
          <div className="font-mono" style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>TradingJournal component renders here</div>
        </div>
      )}
    </div>
  )
}
