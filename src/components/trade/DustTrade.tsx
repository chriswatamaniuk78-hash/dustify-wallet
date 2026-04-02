'use client'

import { useState } from 'react'
import PortfolioDashboard from './PortfolioDashboard'
import BotDashboard from './BotDashboard'
import { OptionsPanel, TaxLossHarvesting } from './OptionsAndTax'

type TradeTab = 'portfolio' | 'bot' | 'options' | 'tax'

const TABS: { id: TradeTab; label: string; icon: string; badge?: string }[] = [
  { id: 'portfolio', label: 'Portfolio',        icon: '◎' },
  { id: 'bot',       label: 'Trading bot',      icon: '◆', badge: 'FREE' },
  { id: 'options',   label: 'Options',          icon: '◉' },
  { id: 'tax',       label: 'Tax harvesting',   icon: '◇' },
]

export default function DustTrade() {
  const [activeTab, setActiveTab] = useState<TradeTab>('portfolio')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Tab bar */}
      <div
        style={{
          display: 'flex',
          gap: 4,
          padding: 4,
          background: 'var(--glass-2)',
          border: '1px solid var(--border-gold-0)',
          borderRadius: 14,
        }}
      >
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1,
              padding: '10px 12px',
              borderRadius: 10,
              border: 'none',
              background: activeTab === tab.id ? 'var(--gold-glass-3)' : 'transparent',
              color: activeTab === tab.id ? 'var(--gold)' : 'var(--text-secondary)',
              fontFamily: "'Geist', system-ui, sans-serif",
              fontSize: 13,
              fontWeight: activeTab === tab.id ? 500 : 400,
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: 7,
              justifyContent: 'center',
              position: 'relative',
            }}
          >
            <span style={{ fontSize: 14 }}>{tab.icon}</span>
            {tab.label}
            {tab.badge && (
              <span
                className="font-mono"
                style={{
                  fontSize: 8,
                  padding: '1px 5px',
                  borderRadius: 100,
                  background: 'rgba(74,222,128,0.15)',
                  color: 'var(--success)',
                  border: '1px solid rgba(74,222,128,0.3)',
                  letterSpacing: '0.08em',
                }}
              >
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'portfolio' && <PortfolioDashboard />}
      {activeTab === 'bot'       && <BotDashboard />}
      {activeTab === 'options'   && <OptionsPanel />}
      {activeTab === 'tax'       && <TaxLossHarvesting />}
    </div>
  )
}
